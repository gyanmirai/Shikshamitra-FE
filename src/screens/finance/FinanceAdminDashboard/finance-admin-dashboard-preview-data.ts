import { financePaths } from 'src/constants/finance-menu';

export type FinancePaymentMethod = {
  id: string;
  label: string;
  amount: number;
  transactions: number;
};

export type DailyFinancePreview = {
  date: string;
  received: number;
  confirmedIncome: number;
  expenses: number;
  transactions: number;
  methods: Record<string, number>;
};

export const financeActivityPreview: DailyFinancePreview[] = [
  {
    date: '2026-11-01',
    received: 96000,
    confirmedIncome: 92000,
    expenses: 26000,
    transactions: 29,
    methods: { cash: 24000, upi: 35000, bank: 24000, cheque: 10000, draft: 3000 },
  },
  {
    date: '2026-11-02',
    received: 118000,
    confirmedIncome: 96000,
    expenses: 27000,
    transactions: 33,
    methods: { cash: 30000, upi: 43000, bank: 31000, cheque: 12000, draft: 2000 },
  },
  {
    date: '2026-11-03',
    received: 124000,
    confirmedIncome: 89000,
    expenses: 29000,
    transactions: 34,
    methods: { cash: 34000, upi: 47000, bank: 30000, cheque: 11000, draft: 2000 },
  },
  {
    date: '2026-11-04',
    received: 144000,
    confirmedIncome: 95000,
    expenses: 34000,
    transactions: 30,
    methods: { cash: 42140, upi: 58160, bank: 35500, cheque: 5560, draft: 2640 },
  },
];

export const financePaymentMethods = [
  { id: 'cash', label: 'Cash', transactions: 41 },
  { id: 'upi', label: 'UPI', transactions: 42 },
  { id: 'bank', label: 'Bank transfer', transactions: 28 },
  { id: 'cheque', label: 'Cheque', transactions: 11 },
  { id: 'draft', label: 'Demand draft', transactions: 4 },
];

export const financeExposurePreview = {
  outstanding: 1876400,
  overdue: 642000,
  overdueStudents: 137,
  separateCharges: 38500,
  classes: [
    { className: 'Class 10', outstanding: 512400, overdue: 212000, students: 42, charges: 12500 },
    { className: 'Class 9', outstanding: 468000, overdue: 174000, students: 36, charges: 9000 },
    { className: 'Class 8', outstanding: 396000, overdue: 128000, students: 28, charges: 7500 },
    { className: 'Class 7', outstanding: 280000, overdue: 88000, students: 21, charges: 6000 },
    { className: 'Class 6', outstanding: 220000, overdue: 40000, students: 10, charges: 3500 },
  ],
};

export const financeQueuePreview = {
  decisions: 18,
  refundAmount: 74500,
  refundRequests: 5,
  cashAwaitingDeposit: 62000,
  nonCashAwaitingVerification: 48000,
  verificationItems: { total: 96, approved: 80, rejected: 4, pending: 12 },
  needsAttention: [
    {
      id: 'PAY-260184',
      title: 'Returned cheque',
      description: '₹12,000 · awaiting follow-up',
      route: financePaths.reconciliation,
      severity: 'error' as const,
    },
    {
      id: 'RF-260042',
      title: 'Refund payout failed',
      description: '₹8,500 · payout needs review',
      route: financePaths.feeRefund,
      severity: 'warning' as const,
    },
    {
      id: 'CON-260081',
      title: 'Concession request',
      description: '₹12,500 · awaiting decision',
      route: financePaths.concession,
      severity: 'info' as const,
    },
    {
      id: 'CHG-260076',
      title: 'Charge line',
      description: '₹3,500 · awaiting review',
      route: financePaths.charges,
      severity: 'info' as const,
    },
    {
      id: 'RF-260058',
      title: 'Refund request',
      description: '₹9,800 · awaiting decision',
      route: financePaths.feeRefund,
      severity: 'info' as const,
    },
  ],
};

export const financeReportShortcuts = [
  'Fee Monthly Register',
  'Fee Collection Month And FeeHeadwise',
  'Bank Deposit Report',
  'Classwise Fee Setup',
];

export function summarizeFinanceActivity(startDate: string, endDate: string) {
  const days = financeActivityPreview.filter(
    (day) => day.date >= startDate && day.date <= endDate
  );

  return days.reduce(
    (summary, day) => {
      summary.received += day.received;
      summary.confirmedIncome += day.confirmedIncome;
      summary.expenses += day.expenses;
      summary.transactions += day.transactions;
      Object.entries(day.methods).forEach(([method, amount]) => {
        summary.methods[method] = (summary.methods[method] ?? 0) + amount;
      });
      summary.days.push(day);
      return summary;
    },
    {
      received: 0,
      confirmedIncome: 0,
      expenses: 0,
      transactions: 0,
      methods: {} as Record<string, number>,
      days: [] as DailyFinancePreview[],
    }
  );
}
