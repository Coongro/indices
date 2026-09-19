/**
 * De dónde salen los valores, según lo que configuró el tenant — leído DEL SERVIDOR.
 *
 * Las dos settings existían y **nadie las leía**: `indices.icl.source` prometía que
 * «manual» desactiva la descarga del BCRA, y la serie se bajaba igual. Peor todavía, la
 * promesa era imposible de cumplir: elegir «manual» apagaba el automatismo sin que
 * hubiera ninguna pantalla donde cargar los valores a mano. Ahora existe (menú Índices),
 * así que la opción es usable y la setting puede hacer lo que dice.
 *
 * Por qué no reusa `settings.gen.ts`: ese archivo importa `useSettings` del SDK y con él
 * React. Importarlo desde un repositorio arrastraría el bundle del navegador al proceso
 * del servidor. Los defaults se duplican a propósito y hay un test que los compara contra
 * el manifest, así que la duplicación no puede desincronizarse en silencio.
 */

import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { sql } from 'drizzle-orm';

/** Las mismas keys que declara el manifest. */
export const SOURCE_SETTING_KEYS = {
  icl: 'indices.icl.source',
  fx: 'indices.fx.source',
} as const;

/** Los mismos defaults que declara el manifest (verificado por test). */
export const SOURCE_DEFAULTS = { icl: 'bcra', fx: 'dolarapi' } as const;

export interface SourcePolicy {
  /** `bcra` baja la serie del organismo; `manual` la deja en manos de quien la carga. */
  icl: 'bcra' | 'manual';
  /** `dolarapi` busca la cotización del día; `manual` usa solo lo cargado. */
  fx: 'dolarapi' | 'manual';
}

/** El valor guardado es texto con JSON adentro; uno viejo puede ser texto pelado. */
function decode(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Un valor corrupto cae al default: quedarse sin serie es peor que bajarla de más. */
export function readSourcePolicy(values: Record<string, unknown>): SourcePolicy {
  const icl = decode(values[SOURCE_SETTING_KEYS.icl]);
  const fx = decode(values[SOURCE_SETTING_KEYS.fx]);
  return {
    icl: icl === 'manual' ? 'manual' : SOURCE_DEFAULTS.icl,
    fx: fx === 'manual' ? 'manual' : SOURCE_DEFAULTS.fx,
  };
}

/**
 * Lo configurado por el tenant. Si la consulta falla se usan los defaults: no poder leer
 * la configuración no puede dejar sin calcular una actualización que el contrato pactó.
 * Queda anotado en la consola, no en silencio.
 */
export async function currentSourcePolicy(db: ModuleDatabaseAPI): Promise<SourcePolicy> {
  let values: Record<string, unknown> = {};
  try {
    const rows = (await db.ormQuery((tx) =>
      tx.execute(
        sql`select key, value from settings where key in (${SOURCE_SETTING_KEYS.icl}, ${SOURCE_SETTING_KEYS.fx}) and scope = 'workspace'`
      )
    )) as unknown as Array<{ key?: string; value?: unknown }>;
    values = Object.fromEntries(
      (rows ?? []).filter((row) => typeof row?.key === 'string').map((row) => [row.key, row.value])
    );
  } catch (error) {
    console.warn(
      '[indices] no se pudo leer de dónde salen los valores; se usan los defaults.',
      error
    );
  }
  return readSourcePolicy(values);
}
