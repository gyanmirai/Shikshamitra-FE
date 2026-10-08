import { refundPaymentMethodsConfig } from './refundPaymentDetailsConfig';

const methodLabels: Record<string, string> = {
  DemandDraft: 'Demand Draft (DD)',
  BankTransfer: 'Bank Transfer (NEFT/RTGS/IMPS)',
  Upi: 'UPI',
};

export const normalizeRefundMethod = (method: string) => methodLabels[method] ?? method;

/** API eligibility and request snapshots use the payment configuration's display labels. */
export const getAllowedRefundMethodOptions = (allowedMethods?: readonly string[]) =>
  Object.keys(refundPaymentMethodsConfig)
    .filter((method) => allowedMethods?.map(normalizeRefundMethod).includes(method))
    .map((method) => ({ value: method, label: method }));

export const isAllowedRefundMethod = (method: string, allowedMethods?: readonly string[]) =>
  Boolean(method && getAllowedRefundMethodOptions(allowedMethods).some((option) => option.value === method));
