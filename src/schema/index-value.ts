import { sql } from 'drizzle-orm';
import { index, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

/**
 * Un valor de una serie de índice en una fecha.
 *
 * El ICL es una serie DIARIA (Com. «B» 12918 del BCRA): el factor de una actualización
 * es el cociente entre el valor de dos fechas. Por eso se guarda la serie entera y no
 * solo el último valor — una actualización de hace seis meses tiene que poder
 * recalcularse igual dentro de dos años, y con los mismos números.
 */
export const indexValueTable = pgTable(
  'module_indices_index_values',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    index_code: text('index_code').notNull(),
    /** Fecha del valor (DateKey `YYYY-MM-DD`). */
    value_date: text('value_date').notNull(),
    value: numeric('value').notNull(),
    /** De dónde salió: `bcra`, `indec`, o `manual` si lo cargó una persona. */
    source: text('source'),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    // Un índice tiene UN valor por fecha: si el job corre dos veces, la segunda no
    // duplica. El valor manual pisa al automático usando el mismo par.
    uniq: uniqueIndex('idx_indices_code_date').on(t.index_code, t.value_date),
    lookupIdx: index('idx_indices_lookup').on(t.index_code, t.value_date),
  })
);

export type IndexValueRow = typeof indexValueTable.$inferSelect;
export type NewIndexValueRow = typeof indexValueTable.$inferInsert;
