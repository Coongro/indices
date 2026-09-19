import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchIpcSeries } from './indec.js';

/**
 * El IPC se baja del INDEC, igual que el ICL del BCRA.
 *
 * Antes era exclusivamente manual y no había pantalla para cargarlo: un contrato
 * ajustado por IPC no se podía actualizar nunca. Lo que se prueba acá es el contrato con
 * la fuente —que devuelve PARES `[fecha, valor]`, no objetos— y que ante una respuesta
 * que no sirve falle en vez de inventar un número: con un índice inventado se le cobra
 * de más o de menos a una persona.
 */
const responder = (body: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({ ok, status, json: async () => body } as unknown as Response);

afterEach(() => vi.unstubAllGlobals());

describe('serie del IPC', () => {
  it('convierte los pares de la API en puntos ordenados de más viejo a más nuevo', async () => {
    vi.stubGlobal(
      'fetch',
      responder({
        data: [
          ['2026-08-01', 12276.766],
          ['2026-06-01', 11826.4103],
          ['2026-07-01', 12076.3937],
        ],
      })
    );

    const points = await fetchIpcSeries({ from: '2026-06-01', to: '2026-08-31' });

    expect(points.map((p) => p.date)).toEqual(['2026-06-01', '2026-07-01', '2026-08-01']);
    expect(points[2].value).toBe(12276.766);
  });

  it('descarta los meses sin publicar en vez de tomarlos como cero', async () => {
    vi.stubGlobal(
      'fetch',
      responder({
        data: [
          ['2026-08-01', 12276.766],
          ['2026-09-01', null],
        ],
      })
    );

    const points = await fetchIpcSeries({ from: '2026-08-01', to: '2026-09-30' });
    expect(points).toHaveLength(1);
    expect(points[0].date).toBe('2026-08-01');
  });

  it('falla si la API no responde bien, en vez de seguir sin serie', async () => {
    vi.stubGlobal('fetch', responder({}, false, 503));
    await expect(fetchIpcSeries({ from: '2026-08-01', to: '2026-08-31' })).rejects.toThrow(/503/);
  });

  it('falla si el período no tiene ningún valor publicado', async () => {
    vi.stubGlobal('fetch', responder({ data: [] }));
    await expect(fetchIpcSeries({ from: '2027-01-01', to: '2027-01-31' })).rejects.toThrow(
      /no publicó valores/i
    );
  });
});
