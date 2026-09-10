export type AccountHeadType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface IAccountHeadOption {
  id: string;
  name: string;
  headType: AccountHeadType;
  displayName: string;
}

export interface IAccountHead {
  id: string;
  academicYearId: string;
  headName: string;
  headType: AccountHeadType;
  nature: 'Debit' | 'Credit';
  parentAccountHeadId?: string | null;
  parentAccountHeadName?: string | null;
  notes?: string | null;
  isActive: boolean;
  deactivationReason?: string | null;
  version: number;
  concurrencyStamp: string;
  isUsedInDownstream: boolean;
  canDelete: boolean;
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
