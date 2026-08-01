import { describe, expect, it } from 'vitest';

import { minusDays } from './range.js';

describe('restar días a una fecha', () => {
  it('resta dentro del mismo mes', () => {
    expect(minusDays('2026-02-15', 10)).toBe('2026-02-05');
  });

  it('cruza el mes hacia atrás sin correrse de año', () => {
    // El bug original: Date.UTC toma el mes 0-indexed y esto daba 2025-08-22.
    expect(minusDays('2025-09-01', 10)).toBe('2025-08-22');
    expect(minusDays('2025-08-01', 10)).toBe('2025-07-22');
  });

  it('cruza el año', () => {
    expect(minusDays('2026-01-05', 10)).toBe('2025-12-26');
  });

  it('respeta los años bisiestos', () => {
    expect(minusDays('2028-03-01', 1)).toBe('2028-02-29');
    expect(minusDays('2026-03-01', 1)).toBe('2026-02-28');
  });
});
