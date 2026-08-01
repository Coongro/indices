import { describe, expect, it } from 'vitest';

import { applyFactor, calcFactor, valueAt } from './factor.js';

// Valores con la forma real de la serie del ICL (base 30/6/2020 = 1).
const serie = [
  { date: '2026-01-15', value: 30 },
  { date: '2026-01-16', value: 30.1 },
  { date: '2026-07-15', value: 34.5 },
  { date: '2026-07-16', value: 34.55 },
  { date: '2026-07-17', value: 34.6 },
];

describe('valor del índice en una fecha', () => {
  it('toma el valor exacto si esa fecha está en la serie', () => {
    expect(valueAt(serie, '2026-07-16')?.value).toBe(34.55);
  });

  it('un domingo o feriado toma el último valor vigente', () => {
    // El 2026-07-18 no está en la serie: rige el del 17.
    expect(valueAt(serie, '2026-07-18')?.value).toBe(34.6);
    expect(valueAt(serie, '2026-07-18')?.date).toBe('2026-07-17');
  });

  it('devuelve null si la fecha es anterior a toda la serie', () => {
    expect(valueAt(serie, '2025-12-01')).toBeNull();
  });
});

describe('factor de actualización', () => {
  it('es el cociente entre las dos fechas', () => {
    const f = calcFactor({ series: serie, dateFrom: '2026-01-15', dateTo: '2026-07-15' });
    expect(f.valueFrom).toBe(30);
    expect(f.valueTo).toBe(34.5);
    expect(f.factor).toBeCloseTo(1.15, 5);
    expect(f.ratePercent).toBe(15);
  });

  it('guarda las fechas realmente usadas, no las pedidas', () => {
    // Se pide el 18 (que no está en la serie): queda registrado que se usó el 17.
    const f = calcFactor({ series: serie, dateFrom: '2026-01-15', dateTo: '2026-07-18' });
    expect(f.dateTo).toBe('2026-07-17');
    expect(f.valueTo).toBe(34.6);
  });

  it('falla si falta el valor base, en vez de estimar', () => {
    expect(() =>
      calcFactor({ series: serie, dateFrom: '2025-01-01', dateTo: '2026-07-15' })
    ).toThrow(/fecha base/);
  });

  it('falla si la fecha del ajuste es anterior a la base', () => {
    expect(() =>
      calcFactor({ series: serie, dateFrom: '2026-07-15', dateTo: '2026-01-15' })
    ).toThrow(/anterior/);
  });

  it('un índice que no se movió da factor 1 (el alquiler no cambia)', () => {
    const plano = [
      { date: '2026-01-01', value: 30 },
      { date: '2026-07-01', value: 30 },
    ];
    const f = calcFactor({ series: plano, dateFrom: '2026-01-01', dateTo: '2026-07-01' });
    expect(f.factor).toBe(1);
    expect(f.ratePercent).toBe(0);
  });
});

describe('nuevo alquiler', () => {
  it('multiplica y redondea a peso entero', () => {
    expect(applyFactor('520000', 1.15)).toBe('598000');
  });

  it('redondea hacia arriba desde .5', () => {
    expect(applyFactor('333333', 1.1)).toBe('366666');
  });

  it('con factor 1 no cambia', () => {
    expect(applyFactor('485000', 1)).toBe('485000');
  });

  it('rechaza un alquiler anterior inválido', () => {
    expect(() => applyFactor('0', 1.15)).toThrow();
    expect(() => applyFactor('no-es-un-monto', 1.15)).toThrow();
  });
});
