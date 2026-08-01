/**
 * AUTO-GENERADO por Coongro Builder — NO editar a mano.
 * Se regenera al guardar la página de settings desde /dev/builder.
 * La lógica de negocio va en un hook de dominio que consume esto.
 */
/* eslint-disable */

import { useSettings } from '@coongro/plugin-sdk';

function toEnum<T extends string>(v: unknown, options: readonly T[], fallback: T): T {
  return typeof v === 'string' && (options as readonly string[]).includes(v) ? (v as T) : fallback;
}

export const ICL_SOURCE = {
  bcra: 'bcra',
  manual: 'manual',
} as const;

export const ADJUSTMENTS_DETECTION = {
  manual: 'manual',
  daily: 'daily',
} as const;

/** Tipo de cada setting por su key punteada (para getSetting). */
export interface IndicesSettingsByKey {
  'indices.icl.source': 'bcra' | 'manual';
  'indices.adjustments.detection': 'manual' | 'daily';
}

/** Settings del plugin con defaults aplicados y coerción por tipo. */
export interface IndicesSettings {
  /** Serie del ICL — «BCRA» baja la serie diaria del organismo cuando hace falta calcular una actualización. «Manual» la desactiva: los valores los cargás vos, y una actualización sin el valor cargado no se calcula. Sirve si trabajás sin internet o si preferís controlar cada número. · `indices.icl.source` · default: `"bcra"` */
  readonly iclSource: 'bcra' | 'manual';
  /** Cuándo buscar contratos a actualizar — «A mano»: buscás vos desde Actualizaciones. «Diaria»: el sistema revisa todos los días y deja las propuestas esperando. En los dos casos el alquiler cambia solo cuando vos confirmás — nunca se aplica solo. · `indices.adjustments.detection` · default: `"manual"` */
  readonly adjustmentsDetection: 'manual' | 'daily';
}

/** Nombre de prop → key punteada del manifest. */
export const SETTING_KEYS = {
  iclSource: 'indices.icl.source',
  adjustmentsDetection: 'indices.adjustments.detection',
} as const;

/** Valores por defecto (los mismos del manifest). */
export const SETTING_DEFAULTS = {
  'indices.icl.source': 'bcra',
  'indices.adjustments.detection': 'manual',
} as const;

const COERCE: {
  [K in keyof IndicesSettingsByKey]: (values: Record<string, unknown>) => IndicesSettingsByKey[K];
} = {
  'indices.icl.source': (values) =>
    toEnum(values['indices.icl.source'], ['bcra', 'manual'], 'bcra'),
  'indices.adjustments.detection': (values) =>
    toEnum(values['indices.adjustments.detection'], ['manual', 'daily'], 'manual'),
};

/** Lee UNA setting tipada desde los valores crudos del tenant (para handlers). */
export function getSetting<K extends keyof IndicesSettingsByKey>(
  values: Record<string, unknown>,
  key: K
): IndicesSettingsByKey[K] {
  return COERCE[key](values);
}

/** Construye el objeto tipado desde los valores crudos (sin hook: handlers/tests). */
export function readIndicesSettings(values: Record<string, unknown>): IndicesSettings {
  return {
    iclSource: COERCE['indices.icl.source'](values),
    adjustmentsDetection: COERCE['indices.adjustments.detection'](values),
  };
}

/**
 * Hook reactivo: settings tipadas del plugin con defaults aplicados.
 * Envolvé esto en un hook de dominio si necesitás lógica de negocio.
 */
export function useIndicesSettings(): { settings: IndicesSettings; loading: boolean } {
  const { values, loading } = useSettings('indices.');
  return { settings: readIndicesSettings(values), loading };
}
