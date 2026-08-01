import type { DateKey } from './dolar.js';

/**
 * Conversión de un importe pactado en moneda extranjera al peso con que se cobra.
 *
 * Vive separado del repositorio por lo mismo que `factor.ts`: es la cuenta que
 * determina cuánta plata se le reclama a alguien, y tiene que poder probarse sin base
 * de datos ni internet.
 */

export interface ConvertedAmount {
  /** Importe original, tal como se pactó. */
  amount: string;
  /** Importe convertido, en pesos. */
  amountArs: string;
  rate: string;
  rateDate: DateKey;
  house: string;
}

/**
 * Importe × cotización, redondeado a peso entero.
 *
 * Mismo criterio que `applyFactor` con el ICL: los alquileres se transfieren en montos
 * redondos, y arrastrar centavos genera diferencias de saldo que nadie reclama pero
 * que ensucian la cuenta corriente para siempre. Un contrato en dólares no tiene por
 * qué comportarse distinto de uno actualizado por índice.
 */
export function convertToArs(amount: string | number, rate: string | number): string {
  const monto = Number(amount);
  const cotizacion = Number(rate);
  if (!Number.isFinite(monto) || monto < 0) {
    throw new Error(`El importe a convertir no es válido: "${amount}".`);
  }
  if (!Number.isFinite(cotizacion) || cotizacion <= 0) {
    throw new Error(`La cotización no es un número usable: "${rate}".`);
  }
  return String(Math.round(monto * cotizacion));
}

/**
 * Cómo se hizo la cuenta, en una línea legible.
 *
 * Se guarda junto al cargo para que el importe pueda explicarse sin tener que
 * reconstruir nada: es el equivalente a guardar los dos valores del índice en una
 * actualización. Sin esto, el inquilino ve un monto en pesos que no coincide con el
 * contrato que firmó y no hay dónde mirar por qué.
 */
export function describeRate({
  amount,
  currency,
  rate,
  rateDate,
  house,
}: {
  amount: string | number;
  currency: string;
  rate: string | number;
  rateDate: DateKey;
  house: string;
}): string {
  const [y, m, d] = String(rateDate).split('-');
  const fecha = y && m && d ? `${d}/${m}/${y}` : String(rateDate);
  return `${currency} ${amount} × $${rate} (${house}, ${fecha})`;
}
