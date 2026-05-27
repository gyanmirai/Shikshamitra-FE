import { FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

export const FINANCE_AUDIT_SUBMODULE_COLORS: Record<string, string> = {
  [FinanceAuditSubModule.COLLECTIONS]: '#4CAF50',
  [FinanceAuditSubModule.CHARGES]: '#FF9800',
  [FinanceAuditSubModule.REFUNDS]: '#F44336',
  [FinanceAuditSubModule.INVOICE_RECEIPTS]: '#3F51B5',
  [FinanceAuditSubModule.CONCESSIONS]: '#9C27B0',
  [FinanceAuditSubModule.RECONCILIATION]: '#009688',
  [FinanceAuditSubModule.INCOME_TRACKING]: '#00BCD4',
  [FinanceAuditSubModule.EXPENSE_TRACKING]: '#795548',
  [FinanceAuditSubModule.ADJUSTMENTS]: '#607D8B',
};
