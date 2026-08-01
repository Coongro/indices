/**
 * @coongro/indices — Exportaciones server-only
 *
 * Schema tables y repositories (dependen de drizzle-orm).
 * NO importar desde el browser — usar '@coongro/indices' para hooks/componentes.
 */
export * from './schema/index-value.js';
export { IndexValueRepository } from './repositories/index-value.repository.js';
export { FxRateRepository } from './repositories/fx-rate.repository.js';
export type { FxConversion, FxRateResult } from './repositories/fx-rate.repository.js';
