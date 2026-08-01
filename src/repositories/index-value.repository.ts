import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';

import { indexValueTable } from '../schema/index-value.js';
import type { IndexValueRow, NewIndexValueRow } from '../schema/index-value.js';
import { fetchSeries, ICL_VARIABLE } from '../services/bcra.js';
import { applyFactor, calcFactor, type AdjustmentFactor } from '../services/factor.js';
import { minusDays } from '../services/range.js';

export class IndexValueRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<IndexValueRow[]> {
    return this.db.ormQuery((tx) => tx.select().from(indexValueTable));
  }

  /**
   * Serie de un índice entre dos fechas, de más vieja a más nueva — el orden que
   * necesita el cálculo del factor.
   */
  async series({
    indexCode,
    from,
    to,
  }: {
    indexCode: string;
    from: string;
    to: string;
  }): Promise<IndexValueRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select()
        .from(indexValueTable)
        .where(
          and(
            eq(indexValueTable.index_code, indexCode),
            gte(indexValueTable.value_date, from),
            lte(indexValueTable.value_date, to)
          )
        )
        .orderBy(asc(indexValueTable.value_date))
    );
  }

  /** Último valor guardado de un índice: hasta dónde llegó la serie. */
  async lastValue({ indexCode }: { indexCode: string }): Promise<IndexValueRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select()
        .from(indexValueTable)
        .where(eq(indexValueTable.index_code, indexCode))
        .orderBy(sql`${indexValueTable.value_date} desc`)
        .limit(1)
    );
    return rows[0];
  }

  /**
   * Guarda valores de la serie sin duplicar: si una fecha ya estaba, se actualiza su
   * valor. El BCRA corrige valores publicados, y bajar la serie dos veces no puede
   * generar dos verdades para el mismo día.
   */
  async upsertMany({
    indexCode,
    source = 'bcra',
    points,
  }: {
    indexCode: string;
    source?: string;
    points: Array<{ date: string; value: number | string }>;
  }): Promise<number> {
    if (points.length === 0) return 0;
    const rows = points.map((p) => ({
      index_code: indexCode,
      value_date: p.date,
      value: String(p.value),
      source,
    })) as unknown as NewIndexValueRow[];

    await this.db.ormQuery((tx) =>
      tx
        .insert(indexValueTable)
        .values(rows)
        .onConflictDoUpdate({
          target: [indexValueTable.index_code, indexValueTable.value_date],
          // Cast por el bug de drizzle 0.38.x: `source` es nullable y desaparece del
          // tipo del update.
          set: {
            value: sql`excluded.value`,
            source: sql`excluded.source`,
          } as unknown as Partial<NewIndexValueRow>,
        })
    );
    return rows.length;
  }

  /**
   * Cotiza una actualización: el factor entre dos fechas y el alquiler resultante.
   *
   * Si la serie guardada no cubre el rango, la baja del BCRA y la guarda — así la
   * primera consulta deja la serie disponible para las siguientes y para reconstruir
   * el cálculo más adelante.
   *
   * Lanza si no se puede calcular. Es deliberado: sin los valores del índice no hay
   * cómo justificar el monto nuevo, y un alquiler no se cambia con una estimación.
   */
  async quote({
    indexCode,
    dateFrom,
    dateTo,
    previousRent,
  }: {
    indexCode: string;
    dateFrom: string;
    dateTo: string;
    previousRent: string;
  }): Promise<AdjustmentFactor & { newRent: string }> {
    let series = await this.series({ indexCode, from: dateFrom, to: dateTo });

    // ¿La serie guardada cubre las dos puntas? Si falta, se baja del organismo.
    const cubre =
      series.length > 0 &&
      series[0].value_date <= dateFrom &&
      series[series.length - 1].value_date >= dateTo;

    if (!cubre) {
      if (indexCode !== 'ICL') {
        throw new Error(
          `No hay valores cargados del índice ${indexCode} entre ${dateFrom} y ${dateTo}. ` +
            `Cargalos a mano o esperá a que se publiquen.`
        );
      }
      // Se pide desde unos días antes: si la fecha base cae domingo o feriado, el
      // valor vigente es el del día hábil anterior.
      const desde = minusDays(dateFrom, 10);
      const points = await fetchSeries({
        variable: ICL_VARIABLE,
        from: desde,
        to: dateTo,
      });
      await this.upsertMany({ indexCode: 'ICL', source: 'bcra', points });
      series = await this.series({ indexCode, from: desde, to: dateTo });
    }

    const factor = calcFactor({
      series: series.map((r) => ({ date: r.value_date, value: Number(r.value) })),
      dateFrom,
      dateTo,
    });

    return { ...factor, newRent: applyFactor(previousRent, factor.factor) };
  }

  async getById({ id }: { id: string }): Promise<IndexValueRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(indexValueTable).where(eq(indexValueTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewIndexValueRow }): Promise<IndexValueRow[]> {
    return this.db.ormQuery((tx) => tx.insert(indexValueTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewIndexValueRow>;
  }): Promise<IndexValueRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(indexValueTable).set(data).where(eq(indexValueTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<void> {
    await this.db.ormQuery((tx) => tx.delete(indexValueTable).where(eq(indexValueTable.id, id)));
  }
}
