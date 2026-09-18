/**
 * Índices — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, useIsMobile, views } from '@coongro/plugin-sdk';

import { useIndicesView } from './use-indices.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function IndicesView() {
  const isMobile = useIsMobile();
  const {
    loading,
    visibleRows,
    COLUMNS,
    removeRow,
    pendingDelete,
    deleting,
    confirmDelete,
    cancelDelete,
    sort,
    onSortChange,
    cellValue,
    search,
    setSearch,
    clearFilters,
    filters,
    setFilters,
    filterOptions,
    page,
    setPage,
    pagedRows,
    metric,
  } = useIndicesView();

  const cellText = (row: any, c: any) => {
    const v = cellValue(row, c);
    return v === null || v === undefined
      ? ''
      : typeof v === 'object'
        ? JSON.stringify(v)
        : String(v);
  };
  const TONE_VARIANT: Record<string, string> = {
    neutral: 'neutral-soft',
    success: 'success-soft',
    warning: 'warning-soft',
    danger: 'danger-soft',
    outline: 'outline',
  };
  const enumVal = (c: any, raw: string) => (c.values ?? []).find((e: any) => e.value === raw);
  const formatDate = (fmt: string, raw: string) => {
    const s = String(raw ?? '');
    const only = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (only) return only[3] + '/' + only[2] + '/' + only[1];
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const p = (n: number) => String(n).padStart(2, '0');
    const dmy = p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
    const hm = p(d.getHours()) + ':' + p(d.getMinutes());
    return fmt === 'datetime' ? dmy + ' ' + hm : fmt === 'time' ? hm : dmy;
  };
  const renderCell = (row: any, c: any) => {
    const raw = cellText(row, c);
    if (raw === '' && c.emptyLabel) {
      return h(
        'span',
        {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--cg-text-muted)',
          },
        },
        c.emptyIcon ? h(UI.DynamicIcon, { icon: c.emptyIcon, size: 15 }) : null,
        c.emptyLabel
      );
    }
    const ev = enumVal(c, raw);
    const label = c.format ? formatDate(c.format, raw) : (ev?.label ?? raw);
    const shown = raw !== '' ? (c.prefix ?? '') + label + (c.suffix ?? '') : label;
    if (c.display === 'avatar') {
      const initial = (String(raw).trim().charAt(0) || '?').toUpperCase();
      return h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
        h(
          'span',
          {
            style: {
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--cg-gold-soft)',
              border: '1px solid var(--cg-gold-lt)',
              color: 'var(--cg-gold-deep)',
              fontWeight: 700,
              fontSize: '11px',
            },
          },
          initial
        ),
        h('span', null, shown)
      );
    }
    const iconName = ev?.icon;
    const icon = iconName ? h(UI.DynamicIcon, { icon: iconName, size: 16 }) : null;
    if (c.display === 'pill') {
      return label
        ? h(
            UI.Badge,
            {
              variant: TONE_VARIANT[ev?.tone ?? c.tone ?? 'neutral'] ?? 'neutral-soft',
              size: 'compact',
              icon,
            },
            label
          )
        : '';
    }
    if (c.display === 'progress') {
      const n = Math.max(0, Math.min(100, Number(cellValue(row, c)) || 0));
      return h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px' } },
        h(
          'div',
          {
            style: {
              flex: '1 1 0',
              height: '6px',
              borderRadius: '999px',
              background: 'var(--cg-bg-secondary)',
              overflow: 'hidden',
            },
          },
          h('div', {
            style: {
              width: n + '%',
              height: '100%',
              borderRadius: '999px',
              background: 'var(--cg-gold)',
            },
          })
        ),
        h(
          'span',
          { style: { fontSize: '12px', color: 'var(--cg-text-muted)' } },
          Math.round(n) + '%'
        )
      );
    }
    if (c.display === 'mono')
      return h(
        'span',
        { style: { fontFamily: 'ui-monospace, monospace', fontSize: '12px' } },
        shown
      );
    return icon
      ? h(
          'span',
          { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          icon,
          shown
        )
      : shown;
  };
  const valueLabel = (key: string, raw: string) =>
    (COLUMNS.find((c) => c.key === key)?.values ?? []).find((v: any) => v.value === raw)?.label ??
    raw;
  const ROW_ACTIONS = [
    {
      label: 'Eliminar',
      variant: 'destructive' as const,
      onClick: (row: any) => {
        void removeRow(row);
      },
    },
  ];
  const renderTable = () =>
    h(
      'div',
      {
        style: {
          background: 'var(--cg-bg)',
          border: '1px solid var(--cg-border)',
          borderRadius: '14px',
          padding: '20px',
        },
      },
      h(UI.DataTable, {
        data: pagedRows,
        rowKey: (row: any) => String(row.id ?? JSON.stringify(row)),
        loading,
        columns: COLUMNS.map((c) => ({
          key: c.key,
          header: c.label,
          sortable: true,
          render: (row: any) => renderCell(row, c),
        })),
        searchPlaceholder: 'Buscar…',
        searchValue: search,
        onSearchChange: setSearch,
        filterSections: [
          {
            label: 'Índice',
            options: [
              { value: '', label: 'Todos' },
              ...(filterOptions['index_code'] ?? []).map((o) => ({
                value: o,
                label: valueLabel('index_code', o),
              })),
            ],
            value: filters['index_code'] ?? '',
            onChange: (v: string) => setFilters((ff: any) => ({ ...ff, ['index_code']: v })),
          },
        ].filter((s) => s.options.length > 1),
        sortKey: sort?.k ?? null,
        sortDirection: sort ? (sort.d > 0 ? 'asc' : 'desc') : null,
        onSortChange,
        pagination: { page, pageSize: 20, total: visibleRows.length },
        onPageChange: setPage,
        onRowClick: (row: any) => {
          views.open('indices.valor-de-indice.open', { record: row }, { mode: 'dialog' });
        },
        actions: ROW_ACTIONS,
        mobileRender: (row: any) =>
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column' as const, gap: '6px' } },
            h(
              'div',
              { style: { fontSize: '14px', fontWeight: 600, color: 'var(--cg-text)' } },
              renderCell(row, COLUMNS[0])
            ),
            ...COLUMNS.slice(1).map((c) =>
              h(
                'div',
                {
                  key: c.key,
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                  },
                },
                h('span', { style: { color: 'var(--cg-text-muted)', flexShrink: 0 } }, c.label),
                h(
                  'span',
                  {
                    style: {
                      textAlign: 'right' as const,
                      minWidth: 0,
                      flex: '1 1 auto',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    },
                  },
                  renderCell(row, c)
                )
              )
            ),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  gap: '4px',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid var(--cg-border-light)',
                  paddingTop: '8px',
                  marginTop: '2px',
                },
              },
              ...ROW_ACTIONS.filter((a2: any) => !a2.hidden?.(row)).map((a2: any) =>
                h(
                  UI.Button,
                  {
                    key: a2.label,
                    size: 'sm' as const,
                    variant:
                      a2.variant === 'destructive' ? ('destructive' as const) : ('ghost' as const),
                    onClick: (e: any) => {
                      e.stopPropagation();
                      a2.onClick(row);
                    },
                  },
                  a2.label
                )
              )
            )
          ),
        onClearFilters: () => {
          clearFilters();
        },
        emptyState: {
          title: 'Todavía no hay valores cargados',
          description: 'El ICL se baja solo cuando hace falta; el IPC y Casa Propia se cargan acá.',
          filteredTitle: 'Sin resultados',
          filteredDescription: 'Probá con otros términos o ajustá los filtros.',
        },
      })
    );

  return h(
    'div',
    {
      style: {
        minHeight: '100%',
        backgroundColor: 'var(--cg-bg-secondary)',
        padding: isMobile ? '16px' : '24px',
      },
    },
    h(
      'div',
      { style: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '18px' } },
      h(
        'div',
        { 'data-cg-block-id': 'row_head', style: { display: 'contents' } },
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 0.62fr) minmax(0, 0.38fr)',
              gap: '2%',
              alignItems: 'stretch',
            },
          },
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'hdr', style: { display: 'contents' } },
              h(
                'div',
                null,
                h(
                  'div',
                  {
                    style: {
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--cg-gold-deep)',
                      marginBottom: '5px',
                    },
                  },
                  'Índices'
                ),
                h(UI.PageHeader, {
                  title: 'Valores de índice',
                  subtitle: 'La serie con la que se actualizan los contratos.',
                })
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'btn_nuevo', style: { display: 'contents' } },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end' } },
                h(
                  UI.Button,
                  {
                    variant: 'default',
                    onClick: () => {
                      views.open('indices.valor-de-indice.open', undefined, { mode: 'dialog' });
                    },
                  },
                  'Cargar valor'
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'row_kpi', style: { display: 'contents' } },
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'minmax(0, 0.34fr) minmax(0, 0.33fr) minmax(0, 0.33fr)',
              gap: '2%',
              alignItems: 'stretch',
            },
          },
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_icl', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-text-muted)',
                        background: 'var(--cg-bg-secondary)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'Landmark', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'ICL'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_icl', 'value', '585,40')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_icl', 'sub', 'al 01/09/2026')
                )
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_ipc', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-text-muted)',
                        background: 'var(--cg-bg-secondary)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'ShoppingCart', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'IPC'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_ipc', 'value', '10.744,18')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_ipc', 'sub', 'al 01/08/2026')
                )
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_casa', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-text-muted)',
                        background: 'var(--cg-bg-secondary)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'House', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Casa Propia'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_casa', 'value', '197,85')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_casa', 'sub', 'al 01/08/2026')
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'sec_serie', style: { display: 'contents' } },
        h(
          'section',
          null,
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
            h('span', {
              style: {
                width: '16px',
                height: '2px',
                background: 'var(--cg-accent)',
                borderRadius: '2px',
              },
            }),
            h(UI.DynamicIcon, {
              icon: 'ChartLine',
              size: 15,
              style: { color: 'var(--cg-text-muted)' },
            }),
            h(
              'span',
              {
                style: {
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--cg-text-muted)',
                },
              },
              'La serie'
            )
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'tbl_valores', style: { display: 'contents' } },
              renderTable()
            )
          )
        )
      )
    ),
    h(UI.ConfirmDialog, {
      open: !!pendingDelete,
      onOpenChange: (o: boolean) => {
        if (!o) cancelDelete();
      },
      title: 'Eliminar registro',
      description: '¿Seguro que querés eliminar este registro? No se puede deshacer.',
      confirmLabel: 'Eliminar',
      loading: deleting,
      onConfirm: () => {
        void confirmDelete();
      },
    })
  );
}
