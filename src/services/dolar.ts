/**
 * Adaptador de cotizaciones del dólar.
 *
 * Un contrato puede pactarse en dólares, pero el cargo se emite y se cobra en pesos:
 * hace falta saber a cuánto estaba el dólar el día que se emitió. De acá sale ese
 * número.
 *
 * Dos fuentes, según la fecha:
 *  - **hoy** → dolarapi.com, que publica el valor del momento.
 *  - **una fecha pasada** → ArgentinaDatos, que tiene la serie histórica. Regenerar el
 *    cargo de un mes viejo tiene que dar el MISMO importe que dio entonces; con la
 *    cotización de hoy daría otro, y el inquilino vería cambiar una deuda que ya
 *    conocía.
 *
 * Las dos son comunitarias y sin API key. Como el ICL, la URL vive solo acá: el resto
 * del kit habla de «la cotización del día», no de un proveedor.
 */

/** Fecha de calendario `YYYY-MM-DD`. */
export type DateKey = string;

const SPOT_BASE = 'https://dolarapi.com/v1/dolares';
const HISTORY_BASE = 'https://api.argentinadatos.com/v1/cotizaciones/dolares';

const TIMEOUT_MS = 15000;

/**
 * Las casas que se pueden pactar en un alquiler.
 *
 * Quedan afuera `cripto` y `tarjeta`, que existen en la fuente pero no son referencia
 * de ningún contrato de locación: la tarjeta es un impuesto al consumo y el cripto no
 * tiene una cotización única y verificable.
 */
export const DOLAR_HOUSES = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'mayorista'] as const;

export type DolarHouse = (typeof DOLAR_HOUSES)[number];

export function isDolarHouse(v: unknown): v is DolarHouse {
  return typeof v === 'string' && (DOLAR_HOUSES as readonly string[]).includes(v);
}

export interface FxPoint {
  /** Fecha a la que corresponde la cotización. */
  date: DateKey;
  buy: number;
  sell: number;
}

interface DolarApiResponse {
  compra?: number;
  venta?: number;
  fecha?: string;
  fechaActualizacion?: string;
}

async function getJson(url: string, what: string): Promise<DolarApiResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `No hay cotización publicada ${what}.`
        : `La fuente de cotizaciones respondió ${res.status} al pedir ${what}.`
    );
  }
  return (await res.json()) as DolarApiResponse;
}

function toPoint(data: DolarApiResponse, fallbackDate: DateKey, what: string): FxPoint {
  const buy = Number(data.compra);
  const sell = Number(data.venta);
  // Sin un número válido NO se cae a un valor por defecto: una cotización inventada
  // cambia lo que se le cobra a una persona. Mismo criterio que el ICL — es preferible
  // que el cargo no se genere y quede a la vista, a que se genere con un número que
  // nadie puede justificar después.
  if (!Number.isFinite(sell) || sell <= 0) {
    throw new Error(`La cotización ${what} vino sin un valor de venta usable.`);
  }
  const date = String(data.fecha ?? data.fechaActualizacion ?? fallbackDate).slice(0, 10);
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallbackDate,
    buy: Number.isFinite(buy) && buy > 0 ? buy : sell,
    sell,
  };
}

/**
 * Cotización de una casa en una fecha.
 *
 * Con `date` de hoy (o sin fecha) trae el valor del momento; con una fecha anterior,
 * el histórico. La fuente arrastra el último día hábil, así que un vencimiento que cae
 * sábado o feriado igual devuelve la cotización vigente ese día.
 */
export async function fetchRate({
  house,
  date,
  today,
}: {
  house: DolarHouse;
  date?: DateKey;
  /** Hoy, inyectable para poder testear sin depender del reloj. */
  today: DateKey;
}): Promise<FxPoint> {
  const wanted = date && date < today ? date : null;

  if (!wanted) {
    const data = await getJson(`${SPOT_BASE}/${house}`, `del dólar ${house}`);
    return toPoint(data, today, `del dólar ${house}`);
  }

  const [y, m, d] = wanted.split('-');
  const data = await getJson(
    `${HISTORY_BASE}/${house}/${y}/${m}/${d}`,
    `del dólar ${house} para el ${wanted}`
  );
  return toPoint(data, wanted, `del dólar ${house} para el ${wanted}`);
}
