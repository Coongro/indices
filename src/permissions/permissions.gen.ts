// Generado por el Coongro Builder desde contributes.permissions. No editar a mano.

export const IndicesPermissions = {
  /** Ver cotizaciones */
  fxRead: 'indices.fx.read',
  /** Eliminar índices */
  valuesDelete: 'indices.values.delete',
  /** Gestionar índices */
  valuesManage: 'indices.values.manage',
  /** Ver índices */
  valuesRead: 'indices.values.read',
} as const;

export type IndicesPermission = (typeof IndicesPermissions)[keyof typeof IndicesPermissions];
