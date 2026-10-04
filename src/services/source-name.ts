/**
 * De dónde salió un valor de la serie, escrito siempre igual.
 *
 * La columna `source` aceptaba cualquier texto, así que la misma fuente entraba de
 * varias formas —`BCRA` por un lado, `bcra` por otro— y la píldora de la pantalla sólo
 * reconoce una: el resto se muestra crudo, con el nombre de la variable a la vista.
 * Normalizar al guardar es lo único que lo evita de verdad; validar sólo en la pantalla
 * deja afuera al Copilot y a cualquier carga por API, que es justo por donde entró.
 */

/** Las fuentes que el kit sabe nombrar. Vacío = lo cargó una persona a mano. */
export const FUENTES = ['bcra', 'indec', 'dolarapi', 'minieco'] as const;
export type Fuente = (typeof FUENTES)[number];

/**
 * Cómo se escribe cada fuente por ahí afuera. Las mayúsculas del BCRA y el nombre
 * completo del Ministerio son lo que trae el dato real, no una rareza a corregir.
 */
const ALIAS: Record<string, Fuente | ''> = {
  bcra: 'bcra',
  'banco central': 'bcra',
  indec: 'indec',
  dolarapi: 'dolarapi',
  'dolar api': 'dolarapi',
  minieco: 'minieco',
  mecon: 'minieco',
  'ministerio de economia': 'minieco',
  'ministerio de economía': 'minieco',
  manual: '',
  'a mano': '',
};

/**
 * Deja el nombre de la fuente en su forma canónica. Vacío para lo cargado a mano.
 *
 * Lo que no reconoce NO lo inventa ni lo deja pasar: un valor que nadie puede nombrar
 * aparecería en pantalla como vino escrito, que es el problema que esto resuelve.
 */
export function normalizeSource(value: unknown): string {
  const crudo = String(value ?? '').trim();
  if (!crudo) return '';
  const clave = crudo.toLowerCase();
  const conocida = ALIAS[clave];
  if (conocida !== undefined) return conocida;
  throw new Error(
    `No sé de qué fuente es «${crudo}». Las que el sistema sabe nombrar son: ${FUENTES.join(', ')} — o dejala vacía si lo cargaste a mano.`
  );
}
