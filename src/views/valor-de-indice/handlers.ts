/**
 * Lógica custom de «Valor de índice» (ValorDeIndiceView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`valor-de-indice.view.ts`,
 * `use-valor-de-indice.ts`, `index.ts`) invocan estos puntos de extensión si
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
  // Reemplaza el guardado por defecto:
  // onSubmit: async (values, { execute, record }) => {
  //   await execute('<prefix>.create', { data: { index_code: values.index_code } });
  // },
  // Valores con los que abre el formulario (solo rellenan lo vacío).
  // `record` = registro en edición; `parentRecord` = ficha desde la que se abrió
  // (el campo ref que apunta a su entidad ya se llena solo si el match es único):
  // onInit: async ({ execute, record, parentRecord }) => ({ index_code: record?.index_code ?? '' }),
  // Botones con acción de servidor (`record` = la fila, si es acción de fila):
  // DeclarÃ¡ una entrada headless.handlers por rama usando el mismo `key`:
  // onAction: async (actionId, { execute, record, toast, reload }) => {
  //   if (actionId === '<action-key>') {
  //     await execute('<prefix>.<command>', { id: record?.id });
  //     reload();
  //   }
  // },
};
