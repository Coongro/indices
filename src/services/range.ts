import type { DateKey } from './bcra.js';

/**
 * Resta días a un DateKey.
 *
 * Existe como función propia porque `Date.UTC` toma el mes **0-indexed**: escribir
 * `Date.UTC(2025, 8, 1)` para el 1 de agosto devuelve septiembre. Ese error hacía que
 * la serie del índice se pidiera empezando un mes tarde y llegara sin la fecha base
 * del ajuste, con lo cual el cálculo fallaba sin explicar por qué.
 */
export function minusDays(date: DateKey, days: number): DateKey {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) - days * 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
