export enum PaymentMethod {
  CASH = 0,
  CHEQUE = 1,
  DEMAND_DRAFT = 2,
  BANK_TRANSFER = 3,
  CREDIT_CARD = 4,
  DEBIT_CARD = 5,
  UPI = 6,
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CHEQUE]: 'Cheque',
  [PaymentMethod.DEMAND_DRAFT]: 'Demand Draft (DD)',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer (NEFT/RTGS/IMPS)',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.UPI]: 'UPI',
};
