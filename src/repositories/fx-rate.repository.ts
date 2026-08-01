import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, eq, sql } from 'drizzle-orm';

import { indexValueTable } from '../schema/index-value.js';
import type { NewIndexValueRow } from '../schema/index-value.js';
import { DOLAR_HOUSES, fetchRate, isDolarHouse, type DolarHouse } from '../services/dolar.js';
import { convertToArs, describeRate } from '../services/fx.js';

/**
 * Cotizaciones de moneda para los contratos pactados en dólares.
 *
 * Vive separado de `IndexValueRepository` porque son dos cosas distintas: un índice
 * actualiza cuánto vale el alquiler, una cotización traduce ese valor a la moneda en
 * la que se cobra. Comparten la tabla de series —las dos son «un valor por fecha»— con
 * códigos propios (`USD_OFICIAL`, `USD_BLUE`…), y con eso comparten también el cache:
 * la cotización de un día se pide una vez y queda guardada.
 *
 * Por qué guardar y no consultar siempre: el importe de un cargo tiene que poder
 * explicarse dentro de dos años, con el mismo número. Si la fuente cambia un valor o
 * desaparece, el cargo ya emitido sigue teniendo su cotización guardada.
 */

/** Fecha de calendario `YYYY-MM-DD`. */
type DateKey = string;

export interface FxRateResult {
  currency: string;
  house: DolarHouse;
  /** Pesos por unidad de la moneda. */
  rate: string;
  /** Fecha de la cotización usada — puede ser anterior a la pedida (fin de semana). */
  rateDate: DateKey;
  source: string;
}

export interface FxConversion extends FxRateResult {
  /** Importe original, en la moneda del contrato. */
  amount: string;
  /** Importe convertido a pesos. */
  amountArs: string;
  /** La cuenta en una línea, para dejarla asentada junto al cargo. */
  detail: string;
}

const codeFor = (house: DolarHouse): string => `USD_${house.toUpperCase()}`;

export class FxRateRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  /** Las casas que se pueden pactar, para ofrecerlas en la configuración. */
  houses(): Promise<readonly string[]> {
    return Promise.resolve(DOLAR_HOUSES);
  }

  /**
   * Cotización de una moneda en una fecha.
   *
   * Primero mira lo guardado; si no está, la trae de la fuente y la guarda. Se usa el
   * valor de **venta**: el inquilino que debe dólares y paga en pesos tiene que conseguir
   * esos dólares, y los compra al precio al que la casa los vende.
   */
  async rate({
    currency = 'USD',
    date,
    house = 'oficial',
  }: {
    currency?: string;
    date?: DateKey;
    house?: string;
  }): Promise<FxRateResult> {
    if (String(currency).toUpperCase() !== 'USD') {
      throw new Error(`Todavía no se cotiza ${currency}: el kit solo maneja contratos en USD.`);
    }
    if (!isDolarHouse(house)) {
      throw new Error(
        `«${house}» no es una cotización válida — opciones: ${DOLAR_HOUSES.join(', ')}.`
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const wanted = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;
    const code = codeFor(house);

    const guardado = await this.db.ormQuery((tx) =>
      tx
        .select()
        .from(indexValueTable)
        .where(and(eq(indexValueTable.index_code, code), eq(indexValueTable.value_date, wanted)))
        .limit(1)
    );
    if (guardado[0]) {
      return {
        currency: 'USD',
        house,
        rate: String(guardado[0].value),
        rateDate: guardado[0].value_date,
        source: guardado[0].source ?? 'cache',
      };
    }

    const point = await fetchRate({ house, date: wanted, today });

    // Se guarda contra la fecha PEDIDA y no contra la que devolvió la fuente: un
    // domingo arrastra el valor del viernes, y queremos que la próxima consulta por ese
    // domingo lo encuentre sin volver a salir a internet.
    const fila = {
      index_code: code,
      value_date: wanted,
      value: String(point.sell),
      source: 'dolarapi',
    } as unknown as NewIndexValueRow;

    await this.db.ormQuery((tx) =>
      tx
        .insert(indexValueTable)
        .values(fila)
        .onConflictDoUpdate({
          target: [indexValueTable.index_code, indexValueTable.value_date],
          // Mismo cast que `upsertMany`: en drizzle 0.38.x las columnas nullables
          // (acá `source`) desaparecen del tipo del update y el literal no compila.
          set: { value: sql`excluded.value` } as unknown as Partial<NewIndexValueRow>,
        })
    );

    return {
      currency: 'USD',
      house,
      rate: String(point.sell),
      rateDate: point.date,
      source: 'dolarapi',
    };
  }

  /**
   * Convierte un importe a pesos y devuelve, además del resultado, la cotización y la
   * fecha con que se hizo la cuenta.
   *
   * Devolver el «cómo» junto al «cuánto» es a propósito: quien emite el cargo tiene que
   * poder dejar asentado con qué dólar se calculó, igual que una actualización guarda
   * los dos valores del índice.
   */
  async convert({
    amount,
    currency = 'USD',
    date,
    house = 'oficial',
  }: {
    amount: string | number;
    currency?: string;
    date?: DateKey;
    house?: string;
  }): Promise<FxConversion> {
    const cotizacion = await this.rate({ currency, date, house });
    return {
      ...cotizacion,
      amount: String(amount),
      amountArs: convertToArs(amount, cotizacion.rate),
      detail: describeRate({
        amount,
        currency: cotizacion.currency,
        rate: cotizacion.rate,
        rateDate: cotizacion.rateDate,
        house: cotizacion.house,
      }),
    };
  }
}
