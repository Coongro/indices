import type { DateKey, SeriesPoint } from './bcra.js';

/**
 * Factor de actualización de un alquiler.
 *
 * El ICL es una serie diaria: el factor es el cociente entre el valor de la fecha del
 * ajuste y el de la fecha base (la del contrato o la del ajuste anterior). Si el
 * índice pasó de 30 a 34,5, el alquiler se multiplica por 1,15 — sube 15%.
 *
 * Los DOS valores usados se guardan junto al ajuste. Es lo que permite que meses
 * después alguien —el inquilino, un juez— pueda rehacer la cuenta y llegar al mismo
 * número. Guardar solo el porcentaje deja el cálculo sin respaldo.
 */

export interface AdjustmentFactor {
  /** Valor del índice en la fecha base. */
  valueFrom: number;
  /** Valor del índice en la fecha del ajuste. */
  valueTo: number;
  /** Cociente entre ambos (1,15 = sube 15%). */
  factor: number;
  /** Variación porcentual, redondeada a dos decimales para mostrar. */
  ratePercent: number;
  dateFrom: DateKey;
  dateTo: DateKey;
}

/**
 * Valor del índice en una fecha. Si esa fecha exacta no está en la serie —un domingo,
 * un feriado— se toma el último valor anterior: es el que estaba vigente ese día.
 */
export function valueAt(series: SeriesPoint[], date: DateKey): SeriesPoint | null {
  let found: SeriesPoint | null = null;
  for (const p of series) {
    if (p.date <= date) found = p;
    else break;
  }
  return found;
}

export function calcFactor({
  series,
  dateFrom,
  dateTo,
}: {
  series: SeriesPoint[];
  dateFrom: DateKey;
  dateTo: DateKey;
}): AdjustmentFactor {
  if (dateTo < dateFrom) {
    throw new Error('La fecha del ajuste no puede ser anterior a la fecha base.');
  }

  const from = valueAt(series, dateFrom);
  const to = valueAt(series, dateTo);

  // Sin alguno de los dos valores no hay cálculo posible. No se estima: un alquiler
  // no puede cambiar por un número aproximado.
  if (!from) throw new Error(`No hay valor del índice para la fecha base ${dateFrom}.`);
  if (!to) throw new Error(`No hay valor del índice para la fecha del ajuste ${dateTo}.`);

  const factor = to.value / from.value;
  return {
    valueFrom: from.value,
    valueTo: to.value,
    factor,
    ratePercent: Math.round((factor - 1) * 10000) / 100,
    dateFrom: from.date,
    dateTo: to.date,
  };
}

/**
 * Nuevo alquiler = anterior × factor, redondeado a peso entero.
 *
 * Se redondea porque un alquiler con centavos no existe en la práctica: se transfiere
 * un monto redondo y los centavos generan diferencias de saldo que nadie reclama pero
 * ensucian la cuenta corriente para siempre.
 */
export function applyFactor(previousRent: string | number, factor: number): string {
  const previous = Number(previousRent);
  if (!Number.isFinite(previous) || previous <= 0) {
    throw new Error('El alquiler anterior no es un monto válido.');
  }
  return String(Math.round(previous * factor));
}
