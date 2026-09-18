import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { readSourcePolicy, SOURCE_DEFAULTS, SOURCE_SETTING_KEYS } from './sources.server.js';

/**
 * El lector del servidor duplica a propósito las keys y los defaults del manifest: no
 * puede importar `settings.gen.ts`, que arrastra React al proceso de la API. Este test
 * es el que impide que esa duplicación se desincronice en silencio — si alguien cambia
 * un default en el manifest, acá se entera.
 */
const manifest = JSON.parse(
  readFileSync(new URL('../../coongro.manifest.json', import.meta.url), 'utf8')
) as {
  contributes: {
    settings: { sections: Array<{ items: Array<{ key: string; default: unknown }> }> };
  };
};

const itemDe = (key: string) =>
  manifest.contributes.settings.sections.flatMap((s) => s.items).find((i) => i.key === key);

describe('de dónde salen los valores', () => {
  it('las keys existen en el manifest', () => {
    expect(itemDe(SOURCE_SETTING_KEYS.icl)).toBeDefined();
    expect(itemDe(SOURCE_SETTING_KEYS.fx)).toBeDefined();
  });

  it('los defaults son los mismos que declara el manifest', () => {
    expect(itemDe(SOURCE_SETTING_KEYS.icl)?.default).toBe(SOURCE_DEFAULTS.icl);
    expect(itemDe(SOURCE_SETTING_KEYS.fx)?.default).toBe(SOURCE_DEFAULTS.fx);
  });

  it('sin nada configurado, se baja de los organismos', () => {
    expect(readSourcePolicy({})).toEqual({ icl: 'bcra', fx: 'dolarapi' });
  });

  it('lee el valor guardado, venga como JSON o como texto pelado', () => {
    expect(readSourcePolicy({ [SOURCE_SETTING_KEYS.icl]: '"manual"' }).icl).toBe('manual');
    expect(readSourcePolicy({ [SOURCE_SETTING_KEYS.fx]: 'manual' }).fx).toBe('manual');
  });

  it('un valor corrupto cae al default en vez de dejar sin serie', () => {
    const p = readSourcePolicy({
      [SOURCE_SETTING_KEYS.icl]: 'cualquier cosa',
      [SOURCE_SETTING_KEYS.fx]: 42,
    });
    expect(p).toEqual({ icl: 'bcra', fx: 'dolarapi' });
  });
});
