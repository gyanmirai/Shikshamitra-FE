export enum FinanceAuditSubModule {
  COLLECTIONS = 'Collections',
  CHARGES = 'Charges',
  REFUNDS = 'Refunds',
  INVOICE_RECEIPTS = 'Invoice & Receipts',
  CONCESSIONS = 'Concessions',
  RECONCILIATION = 'Reconciliation',
  INCOME_TRACKING = 'Income Tracking',
  EXPENSE_TRACKING = 'Expense Tracking',
  ADJUSTMENTS = 'Adjustments',
}

export enum FinanceAuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REFUND = 'REFUND',
  PAYMENT = 'PAYMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  GENERATE_RECEIPT = 'GENERATE_RECEIPT',
  ADD_CHARGE = 'ADD_CHARGE',
  REMOVE_CHARGE = 'REMOVE_CHARGE',
}
