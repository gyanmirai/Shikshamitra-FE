import type { PermissionGrant } from './permission-grants';

export type FinancePermissionAction = 'View' | 'Add' | 'Delete';

const CRUD = { View: ['View'], Add: ['Add'], Delete: ['Delete'] };
const SETTINGS = { ...CRUD, Add: ['Add', 'Edit', 'ChangeStatus'] };

// These are editor bundles of exact server grants, never runtime aliases.
// Unknown future actions and maker/checker bypasses must not be granted by a bundle.
const FINANCE_GROUPS: Record<string, Record<FinancePermissionAction, string[]>> = {
  'Finance.Fees.FeeCollections': { ...CRUD, Add: ['Add', 'ApplyWaiver'], Delete: [] },
  'Finance.Fees.Charges': {
    View: ['View', 'Export', 'ViewAudit'],
    Add: ['Add', 'Update', 'Approve', 'Reject'],
    Delete: ['Delete', 'Void'],
  },
  'Finance.Fees.Refund': {
    View: ['View', 'ViewSensitivePaymentDetails'],
    Add: ['Add', 'Edit', 'Submit', 'StartReview', 'Approve', 'Reject', 'Process', 'VerifyPayout', 'FailPayout', 'RetryProcessing'],
    Delete: ['Delete', 'Cancel', 'Reverse'],
  },
  'Finance.Fees.InvoiceReceipt': { ...CRUD, Add: [], Delete: [] },
  'Finance.Fees.Concession': {
    View: ['View', 'ViewDocument'],
    Add: ['Add', 'Edit', 'Submit', 'UploadDocument', 'Approve', 'Reject'],
    Delete: ['Delete', 'Cancel', 'Reverse'],
  },
  'Finance.Fees.Adjustment': CRUD,
  'Finance.Fees.StructureAssign': {
    ...CRUD,
    Add: ['Add', 'OverrideAmount', 'OverridePolicies'],
    Delete: [],
  },
  'Finance.Settings.FeeCategory': CRUD,
  'Finance.Settings.FeeHead': CRUD,
  'Finance.Settings.ReceiptBook': CRUD,
  'Finance.Settings.PaymentTerms': CRUD,
  'Finance.Settings.FeeStructure': CRUD,
  'Finance.Settings.ConcessionType': SETTINGS,
  'Finance.Settings.ChargeCategory': SETTINGS,
  'Finance.Accounts.CashManagement': { View: ['View'], Add: ['Approve', 'Deposit', 'Reconcile'], Delete: [] },
  'Finance.Accounts.Activity': { ...CRUD, Add: [], Delete: [] },
  'Finance.Accounts.Reconciliation': { ...CRUD, Delete: [] },
  'Finance.Accounts.IncomeTracking': CRUD,
  'Finance.Accounts.ExpenseTracking': CRUD,
  'Finance.Accounts.Settings.IncomeCategory': SETTINGS,
  'Finance.Accounts.Settings.ExpenseCategory': SETTINGS,
  'Finance.Accounts.Settings.BankAccount': SETTINGS,
  'Finance.Accounts.Settings.AccountHead': SETTINGS,
  'Finance.Accounts.Settings.PostingSetup': { ...CRUD, Add: ['Edit'], Delete: [] },
  'Finance.Auditing': { ...CRUD, Add: [], Delete: [] },
  'Finance.Policies.ConcessionPolicy': CRUD,
  'Finance.Policies.RefundPolicy': CRUD,
  'Finance.Policies.CollectionPolicy': {
    ...CRUD,
    View: ['View', 'ViewReports'],
    Add: ['Add', 'EditStudentOverride', 'ManageExceptionWindow'],
  },
  'Finance.Policies.ProrationPolicy': {
    ...CRUD,
    Add: ['Add', 'OverrideChargePeriod', 'Recalculate'],
  },
};

export const isFinancePermissionGroup = (base: string) => Object.prototype.hasOwnProperty.call(FINANCE_GROUPS, base);

export function financeActionPermissionNames(
  base: string,
  action: string,
  permissions: PermissionGrant[]
): string[] {
  const suffixes = FINANCE_GROUPS[base]?.[action as FinancePermissionAction] ?? [];
  const available = new Set(permissions.map(({ name }) => name));
  return suffixes.map((suffix) => `${base}.${suffix}`).filter((name) => available.has(name));
}

export function financePermissionActions(base: string, permissions: PermissionGrant[]) {
  return (['View', 'Add', 'Delete'] as const).filter(
    (action) => financeActionPermissionNames(base, action, permissions).length > 0
  );
}
