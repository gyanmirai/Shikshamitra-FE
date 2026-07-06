// ── Account Head ──
export type AccountHeadType = 'Income' | 'Expense' | 'Bank-Cash' | 'Liability';
export type AccountHeadNature = 'Credit' | 'Debit' | 'Asset';
export type AccountHeadLinkedSource =
  | 'FeeHead'
  | 'ChargeCategory'
  | 'IncomeCategory'
  | 'ExpenseCategory'
  | 'BankAccount'
  | 'PayrollComponent'
  | 'Manual';

export interface IAccountHead {
  id: string;
  headName: string;
  headCode: string;
  headType: AccountHeadType;
  nature: AccountHeadNature; // derived: Income/Liability → Credit, Expense → Debit, Bank-Cash → Asset
  linkedSources: AccountHeadLinkedSource[];
  linkedSourceIds?: string[]; // FK references
  openingBalance?: number;
  runningBalance?: number;
  notes?: string;
  isActive: boolean;
  academicYearId: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Posting ──
export type PostingStatus = 'Draft' | 'Finalised' | 'Reversed';

export interface IAccountPosting {
  id: string;
  postingDate: string;
  headAId: string; // Head that gains
  headBId: string; // Head that gives
  amount: number;
  eventType: string; // e.g. 'FeeReceipt', 'PayrollLock', 'RefundDisbursement'
  sourceModule: string; // 'FeeCollection' | 'Payroll' | 'Refund' | 'Concession' | 'Manual'
  sourceReferenceId?: string; // receipt ID, payslip ID, etc.
  status: PostingStatus;
  academicYearId: string;
  description?: string;
  metadata?: Record<string, any>; // payrollRunId, employeeId, componentType, etc.
  reversalOf?: string; // ID of the posting this reverses
  createdAt?: string;
}

// ── Draft Posting Queue item ──
export interface IDraftPosting extends IAccountPosting {
  status: 'Draft';
  reviewedBy?: string;
  reviewedAt?: string;
}
