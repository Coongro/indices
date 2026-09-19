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

export const FX_SOURCE = {
  dolarapi: 'dolarapi',
  manual: 'manual',
} as const;

/** Tipo de cada setting por su key punteada (para getSetting). */
export interface IndicesSettingsByKey {
  'indices.icl.source': 'bcra' | 'manual';
  'indices.fx.source': 'dolarapi' | 'manual';
}

/** Settings del plugin con defaults aplicados y coerción por tipo. */
export interface IndicesSettings {
  /** Serie del ICL — «BCRA» baja la serie diaria del organismo cuando hace falta calcular una actualización. «Manual» la desactiva: los valores los cargás vos, y una actualización sin el valor cargado no se calcula. Sirve si trabajás sin internet o si preferís controlar cada número. · `indices.icl.source` · default: `"bcra"` */
  readonly iclSource: 'bcra' | 'manual';
  /** Cotización del dólar — «Automática» busca la cotización del día cuando hay que emitir un cargo de un contrato en dólares, y la guarda. «A mano» la desactiva: se usa únicamente lo que esté cargado en Índices, y un cargo sin la cotización del día no se emite en vez de usar una vieja. Elegila a mano si trabajás sin internet o si pactaste con los propietarios un dólar que no es el que publica el mercado. · `indices.fx.source` · default: `"dolarapi"` */
  readonly fxSource: 'dolarapi' | 'manual';
}

/** Nombre de prop → key punteada del manifest. */
export const SETTING_KEYS = {
  iclSource: 'indices.icl.source',
  fxSource: 'indices.fx.source',
} as const;

/** Valores por defecto (los mismos del manifest). */
export const SETTING_DEFAULTS = {
  'indices.icl.source': 'bcra',
  'indices.fx.source': 'dolarapi',
} as const;

const COERCE: {
  [K in keyof IndicesSettingsByKey]: (values: Record<string, unknown>) => IndicesSettingsByKey[K];
} = {
  'indices.icl.source': (values) =>
    toEnum(values['indices.icl.source'], ['bcra', 'manual'], 'bcra'),
  'indices.fx.source': (values) =>
    toEnum(values['indices.fx.source'], ['dolarapi', 'manual'], 'dolarapi'),
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
    fxSource: COERCE['indices.fx.source'](values),
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
