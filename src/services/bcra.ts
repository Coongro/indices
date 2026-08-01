/**
 * Adaptador de la API de estadísticas del BCRA.
 *
 * De acá sale el ICL —«Índice para Contratos de Locación», variable 40—, que es la
 * serie con la que se actualizan la mayoría de los alquileres desde la Ley 27.551.
 *
 * La versión de la API vive SOLO en este archivo: las v2.0 y v3.0 ya devuelven 410
 * (deprecadas), así que la próxima también va a caducar. Cuando pase, se cambia acá y
 * nada más — el resto del kit habla de «traer la serie del ICL», no de una URL.
 */

/** Fecha de calendario `YYYY-MM-DD`. */
export type DateKey = string;

const BASE = 'https://api.bcra.gob.ar/estadisticas/v4.0/monetarias';

/** Variable 40 = Índice para Contratos de Locación (base 30/6/2020 = 1). */
export const ICL_VARIABLE = 40;

const TIMEOUT_MS = 15000;

export interface SeriesPoint {
  date: DateKey;
  value: number;
}

interface BcraResponse {
  results?: Array<{ idVariable?: number; detalle?: Array<{ fecha?: string; valor?: number }> }>;
}

/**
 * Trae la serie de una variable del BCRA entre dos fechas, ordenada de más vieja a
 * más nueva.
 *
 * Lanza si la API no responde o contesta cualquier cosa: acá NO se cae a un valor
 * por defecto. Un índice inventado cambia el alquiler que se le cobra a una persona
 * — es preferible que la actualización no se genere y quede pendiente a que se
 * genere con un número que nadie puede justificar.
 */
export async function fetchSeries({
  variable = ICL_VARIABLE,
  from,
  to,
}: {
  variable?: number;
  from: DateKey;
  to: DateKey;
}): Promise<SeriesPoint[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}/${variable}?desde=${from}&hasta=${to}`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(
      res.status === 410
        ? `El BCRA dio de baja esta versión de su API (410). Hay que actualizar el adaptador.`
        : `El BCRA respondió ${res.status} al pedir la variable ${variable}.`
    );
  }

  const data = (await res.json()) as BcraResponse;
  const detalle = data.results?.[0]?.detalle ?? [];
  const points = detalle
    .map((d) => ({ date: String(d?.fecha ?? ''), value: Number(d?.valor) }))
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isFinite(p.value) && p.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) {
    throw new Error(
      `El BCRA no devolvió valores para la variable ${variable} entre ${from} y ${to}.`
    );
  }
  return points;
}
