export enum PaymentMethod {
  CASH = 0,
  CHEQUE = 1,
  DEMAND_DRAFT = 2,
  BANK_TRANSFER = 3,
  CREDIT_CARD = 4,
  UPI = 5,
  ONLINE_PAYMENT_GATEWAY = 6,
  WALLET = 7,
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CHEQUE]: 'Cheque',
  [PaymentMethod.DEMAND_DRAFT]: 'Demand Draft (DD)',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer (NEFT/RTGS/IMPS)',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.UPI]: 'UPI',
  [PaymentMethod.ONLINE_PAYMENT_GATEWAY]: 'Online Payment Gateway',
  [PaymentMethod.WALLET]: 'Wallet / Prepaid Card',
};
