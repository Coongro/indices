/**
 * Action Contracts de indices.
 *
 * El contrato vive JUNTO al handler y es el MISMO objeto que valida en
 * runtime: por eso lo que se publica no puede desincronizarse de lo que la
 * implementación acepta.
 *
 * `indices` es master-data: guarda las series que publican los organismos (el
 * ICL del BCRA, el dólar) y las ofrece al resto del kit. No tiene pantallas
 * propias, así que este contrato está escrito contra los repositorios.
 *
 * Lo que se publica son LECTURAS. Escribir un valor de índice no se ofrece a
 * ningún agente: un número inventado no rompe nada visible y sin embargo cambia
 * el alquiler de todos los contratos que se actualicen contra esa fecha, con la
 * apariencia de un cálculo oficial. La carga la hace el adaptador contra la
 * fuente, y queda registrada con su `source`.
 */

import { defineAction, none } from '@coongro/plugin-sdk/agentic';

/**
 * Las lecturas de abajo pueden GUARDAR lo que bajan: si la serie no cubre lo
 * que se pide, se trae del organismo y se persiste para no volver a salir a
 * internet por lo mismo. Se declaran `read` igualmente, y es deliberado: lo que
 * escriben es la copia local de un dato público —idempotente, con su fuente
 * anotada—, no estado del negocio. Pedir confirmación para consultar una
 * cotización sería ruido sin nada que decidir.
 */
export const seriesIndexValues = defineAction({
  id: 'indices.values.series',
  title: 'Serie de un índice',
  description:
    'Los valores publicados de un índice entre dos fechas, del más viejo al más nuevo. Es la materia prima con la que se calcula un ajuste: el factor sale de comparar el valor de la fecha base contra el de la fecha nueva.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      indexCode: {
        type: 'string',
        description:
          'Qué índice: «ICL» (el del BCRA, el que usan los alquileres), «IPC», «CasaPropia». Va en mayúsculas.',
      },
      from: {
        type: 'string',
        format: 'date',
        description: 'Desde qué día, como 2026-01-31.',
      },
      to: {
        type: 'string',
        format: 'date',
        description: 'Hasta qué día.',
      },
    },
    required: ['indexCode', 'from', 'to'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'value_date',
        name: 'valueDate',
        label: 'Fecha',
        format: 'date',
      },
      {
        key: 'value',
        name: 'value',
        label: 'Valor',
        format: 'number',
      },
      {
        key: 'source',
        name: 'source',
        label: 'Fuente',
        format: 'text',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const lastValueIndexValues = defineAction({
  id: 'indices.values.lastValue',
  title: 'Último valor publicado',
  description:
    'El valor más reciente que hay guardado de un índice: dice hasta qué día llega la serie. Sirve para saber si ya se puede calcular una actualización o todavía falta que el organismo publique.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      indexCode: {
        type: 'string',
        description: 'Qué índice: «ICL», «IPC», «CasaPropia». Va en mayúsculas.',
      },
    },
    required: ['indexCode'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'value_date',
        name: 'valueDate',
        label: 'Fecha',
        format: 'date',
      },
      {
        key: 'value',
        name: 'value',
        label: 'Valor',
        format: 'number',
      },
      {
        key: 'source',
        name: 'source',
        label: 'Fuente',
        format: 'text',
      },
    ],
    identifierKey: 'id',
  },
});

export const quoteIndexValues = defineAction({
  id: 'indices.values.quote',
  title: 'Cotizar una actualización de alquiler',
  description:
    'Calcula cuánto pasaría a valer un alquiler al actualizarlo por un índice: devuelve el factor entre las dos fechas, los dos valores con los que se calculó y el monto resultante. NO cambia ningún contrato — es la cuenta, no la aplicación. Si la serie guardada no llega, la baja del organismo. Falla en vez de estimar cuando no hay valores: un alquiler no se cambia con un número aproximado.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      indexCode: {
        type: 'string',
        description:
          'Con qué índice se actualiza, según lo pactado en el contrato: «ICL», «IPC», «CasaPropia». Solo el ICL se baja solo; para los demás los valores tienen que estar cargados.',
      },
      dateFrom: {
        type: 'string',
        format: 'date',
        description: 'La fecha base: desde cuándo rige el alquiler que se va a actualizar.',
      },
      dateTo: {
        type: 'string',
        format: 'date',
        description: 'La fecha de la actualización.',
      },
      previousRent: {
        type: 'string',
        pattern: '^-?\\d+(?:\\.\\d+)?$',
        description: 'El alquiler vigente, el que se va a multiplicar por el factor.',
      },
    },
    required: ['indexCode', 'dateFrom', 'dateTo', 'previousRent'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'newRent',
        name: 'newRent',
        label: 'Alquiler actualizado',
        format: 'money',
      },
      {
        key: 'factor',
        name: 'factor',
        label: 'Factor',
        format: 'number',
      },
      {
        key: 'valueFrom',
        name: 'valueFrom',
        label: 'Índice en la fecha base',
        format: 'number',
      },
      {
        key: 'valueTo',
        name: 'valueTo',
        label: 'Índice en la fecha nueva',
        format: 'number',
      },
    ],
  },
});

export const rateFx = defineAction({
  id: 'indices.fx.rate',
  title: 'Cotización del dólar',
  description:
    'A cuánto estaba el dólar un día. Se devuelve el valor de VENTA: el inquilino que debe dólares y paga en pesos tiene que conseguirlos, y los compra al precio al que la casa los vende.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      currency: {
        type: 'string',
        description: 'Qué moneda. Hoy solo «USD»: el kit únicamente maneja contratos en dólares.',
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'De qué día. Si se omite, hoy. Un domingo arrastra el valor del viernes.',
      },
      house: {
        type: 'string',
        description:
          'Qué cotización, según lo que se haya pactado en el contrato: «oficial», «blue», «mep», entre otras. Si se omite, la oficial. Las disponibles las lista «Cotizaciones disponibles».',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'rate',
        name: 'rate',
        label: 'Cotización',
        format: 'money',
      },
      {
        key: 'rateDate',
        name: 'rateDate',
        label: 'Del día',
        format: 'date',
      },
      {
        key: 'house',
        name: 'house',
        label: 'Cotización usada',
        format: 'text',
      },
      {
        key: 'source',
        name: 'source',
        label: 'Fuente',
        format: 'text',
      },
    ],
  },
});

export const convertFx = defineAction({
  id: 'indices.fx.convert',
  title: 'Pasar un importe en dólares a pesos',
  description:
    'Convierte un monto a pesos y devuelve, además del resultado, con qué cotización y de qué día se hizo la cuenta. El «cómo» viene junto al «cuánto» a propósito: quien emite un cargo en dólares tiene que poder dejar asentado con qué dólar se calculó.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      amount: {
        type: 'string',
        pattern: '^-?\\d+(?:\\.\\d+)?$',
        description: 'El importe en la moneda de origen.',
      },
      currency: {
        type: 'string',
        description: 'Qué moneda. Hoy solo «USD».',
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Con la cotización de qué día. Si se omite, hoy.',
      },
      house: {
        type: 'string',
        description: 'Qué cotización usar, según lo pactado. Si se omite, la oficial.',
      },
    },
    required: ['amount'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'amountArs',
        name: 'amountArs',
        label: 'En pesos',
        format: 'money',
      },
      {
        key: 'rate',
        name: 'rate',
        label: 'Cotización',
        format: 'money',
      },
      {
        key: 'rateDate',
        name: 'rateDate',
        label: 'Del día',
        format: 'date',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'La cuenta',
        format: 'text',
      },
    ],
  },
});

export const housesFx = defineAction({
  id: 'indices.fx.houses',
  title: 'Cotizaciones disponibles',
  description:
    'Qué cotizaciones del dólar se pueden pactar en un contrato: oficial, blue, mep y las demás. Es la lista de valores válidos para el resto de las capacidades de moneda.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  // No lleva argumentos: es la lista completa de casas admitidas.
  input: none(),
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'house',
        name: 'house',
        label: 'Cotización',
        format: 'text',
      },
    ],
    defaultLimit: 20,
    maxLimit: 50,
  },
});
