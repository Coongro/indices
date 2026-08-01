/**
 * @coongro/indices — Entry point principal (browser-safe)
 *
 * Exportar aquí: hooks, componentes, tipos, utilidades.
 * NO exportar schema tables ni repositories (usan drizzle-orm, solo backend).
 * Para exports server-only → usar server.ts
 */

/**
 * La cuenta de la conversión y su constancia.
 *
 * Se exponen para que quien emite los cargos cotice UNA vez por corrida y convierta
 * los importes en el momento, en vez de pedir una conversión por cada monto: la cuenta
 * es una multiplicación y no hace falta cruzar la red para hacerla. Lo que no puede
 * repetirse por su cuenta es el criterio —el redondeo a peso entero y el texto que deja
 * asentado cómo se calculó—, y por eso sale de acá y no de cada plugin.
 */
export { convertToArs, describeRate, type ConvertedAmount } from './services/fx.js';
export { DOLAR_HOUSES, isDolarHouse, type DolarHouse } from './services/dolar.js';
