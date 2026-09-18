/**
 * Adaptador de la API de Series de Tiempo del Estado (`apis.datos.gob.ar`).
 *
 * De acá sale el IPC —«Índice de Precios al Consumidor Nacional, nivel general», base
 * diciembre 2016— que publica el INDEC y con el que se actualizan los contratos
 * pactados por inflación.
 *
 * Hasta ahora el IPC era exclusivamente manual: solo el ICL se bajaba solo, así que un
 * contrato ajustado por IPC no se podía actualizar si nadie cargaba los valores a mano
 * — y no había ninguna pantalla para hacerlo.
 *
 * El id de la serie y la URL viven SOLO en este archivo, igual que la versión de la API
 * del BCRA vive solo en `bcra.ts`: el resto del kit habla de «traer la serie del IPC».
 *
 * Casa Propia no está acá porque no tiene API: ese coeficiente se publica como tabla, no
 * como serie, y sigue cargándose a mano desde la pantalla de Índices.
 */

import type { DateKey, SeriesPoint } from './bcra.js';

const BASE = 'https://apis.datos.gob.ar/series/api/series';

/** IPC Nacional, nivel general, base diciembre 2016 = 100. Mensual. */
export const IPC_SERIES_ID = '148.3_INIVELNAL_DICI_M_26';

const TIMEOUT_MS = 15000;

/** `{ data: [[fecha, valor], ...] }` — la API devuelve pares, no objetos. */
interface SeriesApiResponse {
  data?: Array<[string, number | null]>;
}

/**
 * Trae la serie del IPC entre dos fechas, de la más vieja a la más nueva.
 *
 * Lanza si la API no responde o contesta cualquier cosa. Acá NO se cae a un valor por
 * defecto, por lo mismo que en el BCRA: un índice inventado cambia el alquiler que se le
 * cobra a una persona, y es preferible que la actualización quede pendiente a que se
 * calcule con un número que nadie puede justificar.
 *
 * El IPC es MENSUAL y se publica con el primer día del mes como fecha. Quien lo consuma
 * toma «el último valor vigente» (`services/factor.ts`), así que una fecha base a mitad
 * de mes usa el valor de ese mes sin que haga falta rellenar los días.
 */
export async function fetchIpcSeries({
  from,
  to,
}: {
  from: DateKey;
  to: DateKey;
}): Promise<SeriesPoint[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const url =
    `${BASE}?ids=${IPC_SERIES_ID}&start_date=${from}&end_date=${to}` +
    `&limit=1000&format=json&metadata=none`;

  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(
      `La API de series del Estado respondió ${res.status} al pedir el IPC (${IPC_SERIES_ID}).`
    );
  }

  const data = (await res.json()) as SeriesApiResponse;
  const points = (data.data ?? [])
    .map(([fecha, valor]) => ({ date: String(fecha ?? ''), value: Number(valor) }))
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isFinite(p.value) && p.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) {
    throw new Error(`El INDEC no publicó valores de IPC entre ${from} y ${to}.`);
  }
  return points;
}
