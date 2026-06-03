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

const COLOR_ALIASES: Record<string, string> = {
  red: '#F44336',
  purple: '#9C27B0',
  blue: '#3F51B5',
  brown: '#795548',
  'light blue': '#00BCD4',
  lightblue: '#00BCD4',
  grey: '#607D8B',
  gray: '#607D8B',
};

const normalizeAuditColor = (rawColor: string): string => {
  const safeColor = (rawColor || '').trim();
  if (!safeColor) return '#607D8B';

  const colorKey = safeColor.toLowerCase();
  if (COLOR_ALIASES[colorKey]) return COLOR_ALIASES[colorKey];

  const compactKey = colorKey.replace(/\s+/g, '');
  if (COLOR_ALIASES[compactKey]) return COLOR_ALIASES[compactKey];

  return safeColor;
};

export const resolveFinanceAuditColor = (color?: string) => normalizeAuditColor(color || '#607D8B');

export const getFinanceAuditSubModuleColor = (subModule?: string) =>
  normalizeAuditColor(FINANCE_AUDIT_SUBMODULE_COLORS[subModule || ''] || '#607D8B');

export const FINANCE_AUDIT_LEGEND = [
  {
    label: 'Collections',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.COLLECTIONS],
  },
  { label: 'Charges', color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.CHARGES] },
  { label: 'Refunds', color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.REFUNDS] },
  {
    label: 'Receipts',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.INVOICE_RECEIPTS],
  },
  {
    label: 'Concessions',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.CONCESSIONS],
  },
  {
    label: 'Adjustments',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.ADJUSTMENTS],
  },
  {
    label: 'Reconciliation',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.RECONCILIATION],
  },
  { label: 'Income', color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.INCOME_TRACKING] },
  {
    label: 'Expense',
    color: FINANCE_AUDIT_SUBMODULE_COLORS[FinanceAuditSubModule.EXPENSE_TRACKING],
  },
];
