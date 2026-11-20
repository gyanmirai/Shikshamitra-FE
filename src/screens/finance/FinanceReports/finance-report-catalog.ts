import type { FinanceReportOption } from 'src/redux/finance/reports/financeReportsApi';

export const phaseOneReports = [
  'Fee demand and collection summary',
  'Outstanding fees and ageing',
  'Student fee statement',
  'Daily collection register',
  'Receipt register and corrections',
  'Payment verification and clearing ageing',
] as const;

const [demand, outstanding, statement, daily, receipts, verification] = phaseOneReports;
const placement = ['boardId', 'mediumId', 'organizationIds', 'classIds', 'divisionIds'] as const;

const accountReportIds = new Set([verification, 'Fee List Cheque Clear Date Wise', 'Bank Deposit Report']);

export function getFinanceReportGroups(reports: readonly FinanceReportOption[]) {
  return [
    {
      id: 'fees',
      name: 'Fees Reports',
      icon: 'mdi:file-document-multiple-outline',
      reports: reports.filter((report) => !accountReportIds.has(report.id)),
    },
    {
      id: 'accounts',
      name: 'Accounts Reports',
      icon: 'mdi:bank-outline',
      reports: reports.filter((report) => accountReportIds.has(report.id)),
    },
  ].filter((group) => group.reports.length > 0);
}

const fieldsByReport: Record<string, readonly string[]> = {
  [demand]: [...placement, 'feeHeadIds', 'groupBy', 'dateRange'],
  [outstanding]: [...placement, 'feeHeadIds', 'installment', 'ageingBucket', 'status'],
  [statement]: [...placement, 'payerSearch', 'feeHeadIds', 'dateRange'],
  [daily]: [...placement, 'receiptBookIds', 'paymentMethod', 'collector', 'status', 'dateRange'],
  [receipts]: [...placement, 'receiptBookIds', 'receiptNumber', 'payerSearch', 'receiptKind', 'status', 'dateRange'],
  [verification]: [...placement, 'paymentMethod', 'bank', 'status', 'ageingBucket', 'dateBasis', 'dateRange'],
  'Fee Collection Batch And Monthwise': ['months'],
  'Fee Collection Batchwise': [],
  'Fee Collection Month And FeeHeadwise': ['months', 'feeHeadIds'],
  'Fee Collection Student With Feewise': [...placement, 'dateRange'],
  'Fee List Cheque Clear Date Wise': [...placement, 'dateRange'],
  'Fee Monthly Register': [...placement, 'receiptBookIds'],
  'Bank Deposit Report': [...placement, 'receiptBookIds', 'dateRange'],
  'Classwise Fee Setup': ['boardId', 'mediumId', 'organizationIds', 'classIds'],
  'Custom Group Receipt List': [...placement, 'receiptBookIds', 'dateRange'],
  'Fee Register All Student': [...placement],
};

export const reportFields = (reportType: string) => fieldsByReport[reportType] ?? [];

export const reportDescriptions: Record<string, string> = {
  [demand]: 'Current balances for installments in the selected demand period, grouped by class and division or by fee head.',
  [outstanding]: 'Current unpaid principal. An installment becomes overdue after its due date and only once billed.',
  [statement]: 'Current installment balances for one payer. The demand period selects installments.',
  [daily]: 'One row per payment instrument. Linked receipts are shown as supporting documents.',
  [receipts]: 'One row per document, including rejected or superseded provisional receipts. Document amounts can describe the same payment.',
  [verification]: 'Non-cash instruments and their recorded verification decisions. Pending age uses the current school date.',
  'Fee List Cheque Clear Date Wise': 'Cleared fee receipts and their payment details by clearance date.',
  'Bank Deposit Report': 'Legacy receipt and payment reference detail. For confirmed deposits, use Cash Management.',
};

const pendingAges = ['1–30 days', '31–60 days', '61–90 days', '91+ days'];

export const reportStatusOptions: Record<string, string[]> = {
  [outstanding]: ['Pending', 'Partial', 'Overdue', 'InReconciliation', 'Future'],
  [daily]: ['Cash', 'Pending verification', 'Verified', 'Rejected', 'Reversed', 'Unavailable'],
  [receipts]: ['Official', 'Pending verification', 'Verified provisional', 'Rejected', 'Reversed'],
  [verification]: ['Pending verification', 'Verified', 'Rejected', 'Reversed', 'Unavailable'],
};

export const reportAgeingOptions = (reportType: string) =>
  [reportType === outstanding ? 'Not overdue' : 'Same day', ...pendingAges];
