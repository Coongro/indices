/**
 * Valor de índice — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useValorDeIndiceView } from './use-valor-de-indice.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function ValorDeIndiceView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, submit, editingId } = useValorDeIndiceView();

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const } },
    h(
      'div',
      {
        style: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      },
      h(
        'div',
        { 'data-cg-block-id': 's1', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'TrendingUp', title: 'El valor' },
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
              { 'data-cg-block-id': 'f_code', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'index_code', style: { display: 'block', marginBottom: '6px' } },
                  'Índice',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['index_code'] ?? ''),
                    onValueChange: (v: string) => setField('index_code', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'ICL',
                      value: 'ICL',
                      icon: h(UI.DynamicIcon, { icon: 'Landmark', size: 16 }),
                    },
                    'ICL · Contratos de locación'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'IPC',
                      value: 'IPC',
                      icon: h(UI.DynamicIcon, { icon: 'ShoppingCart', size: 16 }),
                    },
                    'IPC · Precios al consumidor'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'casa_propia',
                      value: 'casa_propia',
                      icon: h(UI.DynamicIcon, { icon: 'House', size: 16 }),
                    },
                    'Casa Propia'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'USD_OFICIAL',
                      value: 'USD_OFICIAL',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Dólar oficial'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'USD_BLUE',
                      value: 'USD_BLUE',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Dólar blue'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'USD_BOLSA',
                      value: 'USD_BOLSA',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Dólar MEP'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'USD_CONTADOCONLIQUI',
                      value: 'USD_CONTADOCONLIQUI',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Contado con liqui'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'USD_MAYORISTA',
                      value: 'USD_MAYORISTA',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Dólar mayorista'
                  )
                ),
                errors['index_code']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['index_code']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_date', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'value_date', style: { display: 'block', marginBottom: '6px' } },
                    'Fecha del valor',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'value_date',
                    type: 'date',
                    value: String(values['value_date'] ?? ''),
                    onChange: (e: any) => setField('value_date', e.target.value),
                  }),
                  errors['value_date']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['value_date']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_value', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'value', style: { display: 'block', marginBottom: '6px' } },
                    'Valor',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'value',
                    type: 'number',
                    value: values['value'] ?? '',
                    placeholder: 'Ej: 585,40',
                    onChange: (e: any) =>
                      setField('value', e.target.value === '' ? null : Number(e.target.value)),
                  }),
                  errors['value']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['value']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_source', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'source', style: { display: 'block', marginBottom: '6px' } },
                  'De dónde salió'
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['source'] ?? ''),
                    onValueChange: (v: string) => setField('source', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'bcra',
                      value: 'bcra',
                      icon: h(UI.DynamicIcon, { icon: 'Landmark', size: 16 }),
                    },
                    'BCRA'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'indec',
                      value: 'indec',
                      icon: h(UI.DynamicIcon, { icon: 'ChartNoAxesColumn', size: 16 }),
                    },
                    'INDEC'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'dolarapi',
                      value: 'dolarapi',
                      icon: h(UI.DynamicIcon, { icon: 'DollarSign', size: 16 }),
                    },
                    'Cotización del día'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'manual',
                      value: 'manual',
                      icon: h(UI.DynamicIcon, { icon: 'PenLine', size: 16 }),
                    },
                    'Cargado a mano'
                  )
                ),
                errors['source']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['source']
                    )
                  : null
              )
            )
          )
        )
      )
    ),
    h(
      UI.DialogFooter,
      null,
      h(
        UI.Button,
        {
          variant: 'ghost',
          onClick: () => {
            closeDialog();
          },
        },
        'Cancelar'
      ),
      h(
        UI.Button,
        {
          onClick: () => {
            void submit();
          },
        },
        editingId ? 'Actualizar' : 'Guardar'
      )
    )
  );
}
