import { describe, expect, it } from 'vitest';

import { isDolarHouse, DOLAR_HOUSES } from './dolar.js';
import { convertToArs, describeRate } from './fx.js';

describe('conversión a pesos', () => {
  it('multiplica el importe por la cotización', () => {
    // Un alquiler de USD 1.200 con el dólar a $1.510.
    expect(convertToArs('1200', '1510')).toBe('1812000');
  });

  it('redondea a peso entero, como el ajuste por índice', () => {
    // 1200,50 × 1510,25 = 1.813.055,125 → sin centavos, que ensucian la cuenta corriente.
    expect(convertToArs('1200.50', '1510.25')).toBe('1813055');
    expect(convertToArs(100, 1510.4)).toBe('151040');
  });

  it('acepta importe cero: un contrato puede tener expensas en cero', () => {
    expect(convertToArs(0, 1510)).toBe('0');
  });

  it('no inventa un resultado si el importe no es un número', () => {
    expect(() => convertToArs('mil doscientos', 1510)).toThrow();
    expect(() => convertToArs(-100, 1510)).toThrow();
  });

  it('no convierte con una cotización inservible', () => {
    // Preferimos que el cargo no se genere antes que emitirlo con un número inventado.
    expect(() => convertToArs(1200, 0)).toThrow();
    expect(() => convertToArs(1200, '')).toThrow();
    expect(() => convertToArs(1200, -1510)).toThrow();
  });
});

describe('constancia de cómo se hizo la cuenta', () => {
  it('deja el importe, la cotización, la casa y la fecha en formato local', () => {
    expect(
      describeRate({
        amount: '1200',
        currency: 'USD',
        rate: '1510',
        rateDate: '2026-07-31',
        house: 'oficial',
      })
    ).toBe('USD 1200 × $1510 (oficial, 31/07/2026)');
  });

  it('no rompe si la fecha viene con otra forma', () => {
    const t = describeRate({
      amount: 1,
      currency: 'USD',
      rate: 1,
      rateDate: 'sin fecha',
      house: 'blue',
    });
    expect(t).toContain('sin fecha');
  });
});

describe('casas de cotización aceptadas', () => {
  it('reconoce las que se pueden pactar en un alquiler', () => {
    for (const h of DOLAR_HOUSES) expect(isDolarHouse(h)).toBe(true);
  });

  it('rechaza las que no son referencia de un contrato', () => {
    // Existen en la fuente pero no sirven de referencia: la tarjeta es un impuesto al
    // consumo y el cripto no tiene una cotización única y verificable.
    expect(isDolarHouse('tarjeta')).toBe(false);
    expect(isDolarHouse('cripto')).toBe(false);
    expect(isDolarHouse('')).toBe(false);
    expect(isDolarHouse(undefined)).toBe(false);
  });
});
