/**
 * Lógica custom de «Índices» (IndicesView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`indices.view.ts`,
 * `use-indices.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 * Cada punto que implementes debe clasificarse en `spec.json > headless.handlers`
 * como query, command, presentation o uiOnly. Builder lo muestra durante el
 * desarrollo y evita que la funcionalidad desaparezca de Copilot/MCP.
 *
 * El contrato completo (con la documentación de cada punto) está en
 * `CustomHandlers` de `@coongro/plugin-sdk`. De ahí salen también
 * `formatMoney`, `formatDateKey`, `periodLabel`, `plural` y `sharedLoad`
 * (comparte una consulta entre los bloques que se montan a la vez).
 */
import type { CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  // Filas de la tabla, cuando no salen de un `source` declarado:
  // loadData: ({ execute, record }) => execute('<prefix>.list'),
  // Lo que muestran los indicadores y la cabecera. Sin esto se ven los
  // números escritos en el diseño, que son de mentira:
  // loadLiveValues: async ({ execute, record }) => ({
  //   k_icl: { value: '0', sub: 'de qué' },
  //   k_ipc: { value: '0', sub: 'de qué' },
  // }),
  // Botones con acción de servidor (`record` = la fila, si es acción de fila):
  // DeclarÃ¡ una entrada headless.handlers por rama usando el mismo `key`:
  // onAction: async (actionId, { execute, record, toast, reload }) => {
  //   if (actionId === '<action-key>') {
  //     await execute('<prefix>.<command>', { id: record?.id });
  //     reload();
  //   }
  // },
};
