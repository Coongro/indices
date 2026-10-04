import { describe, expect, it } from 'vitest';

import { normalizeSource } from './source-name.js';

describe('normalizeSource', () => {
  it('el BCRA se escribe igual venga como venga', () => {
    // Los datos reales traían las dos formas y la píldora sólo reconocía una.
    expect(normalizeSource('BCRA')).toBe('bcra');
    expect(normalizeSource('bcra')).toBe('bcra');
    expect(normalizeSource(' Banco Central ')).toBe('bcra');
  });

  it('el Ministerio de Economía tiene nombre propio: publica el Casa Propia', () => {
    expect(normalizeSource('Ministerio de Economía')).toBe('minieco');
    expect(normalizeSource('MECON')).toBe('minieco');
  });

  it('cargado a mano es no tener fuente, no una fuente llamada «manual»', () => {
    expect(normalizeSource('manual')).toBe('');
    expect(normalizeSource('')).toBe('');
    expect(normalizeSource(null)).toBe('');
  });

  it('una fuente que nadie puede nombrar se rechaza en vez de llegar a la pantalla', () => {
    expect(() => normalizeSource('Pepe')).toThrow(/No sé de qué fuente/);
  });
});
