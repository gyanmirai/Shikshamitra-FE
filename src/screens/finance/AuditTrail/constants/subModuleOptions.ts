import { FinanceAuditAction, FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

export const FINANCE_AUDIT_SUBMODULE_OPTIONS = [
  { label: 'All Modules', value: 'All Modules' },
  { label: 'Collections', value: FinanceAuditSubModule.COLLECTIONS },
  { label: 'Charges', value: FinanceAuditSubModule.CHARGES },
  { label: 'Refunds', value: FinanceAuditSubModule.REFUNDS },
  { label: 'Receipts', value: FinanceAuditSubModule.INVOICE_RECEIPTS },
  { label: 'Concessions', value: FinanceAuditSubModule.CONCESSIONS },
  { label: 'Reconciliation', value: FinanceAuditSubModule.RECONCILIATION },
  { label: 'Income Tracking', value: FinanceAuditSubModule.INCOME_TRACKING },
  { label: 'Expense Tracking', value: FinanceAuditSubModule.EXPENSE_TRACKING },
  { label: 'Adjustments', value: FinanceAuditSubModule.ADJUSTMENTS },
];

export const FINANCE_AUDIT_ACTION_OPTIONS = [
  { label: 'All Actions', value: 'All Actions' },
  { label: 'Create', value: FinanceAuditAction.CREATE },
  { label: 'Update', value: FinanceAuditAction.UPDATE },
  { label: 'Delete', value: FinanceAuditAction.DELETE },
  { label: 'Approve', value: FinanceAuditAction.APPROVE },
  { label: 'Reject', value: FinanceAuditAction.REJECT },
  { label: 'Refund', value: FinanceAuditAction.REFUND },
  { label: 'Payment', value: FinanceAuditAction.PAYMENT },
  { label: 'Adjustment', value: FinanceAuditAction.ADJUSTMENT },
  { label: 'Generate Receipt', value: FinanceAuditAction.GENERATE_RECEIPT },
  { label: 'Add Charge', value: FinanceAuditAction.ADD_CHARGE },
  { label: 'Remove Charge', value: FinanceAuditAction.REMOVE_CHARGE },
];
