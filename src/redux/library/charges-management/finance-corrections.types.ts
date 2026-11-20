import type {
  FeeRefundPreviewDto,
  FeeRefundRequestDto,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import type { FinanceOperatorPage } from './finance-operator.types';
import type { FinanceExternalSource, FinanceExternalReceivable } from './finance-external.types';

export enum FinanceWaiverAction {
  Apply = 0,
  Approve = 1,
  Reject = 2,
  Reverse = 3,
}

export type FinanceWaiverContextItem = {
  requestId: string;
  applicationId: string | null;
  state: number;
  requestedAmount: number;
  appliedAmount: number;
  reversedAmount: number;
  reversibleAmount: number;
  reason: string;
  canAct: boolean;
  issues: string[];
};

export type FinanceWaiverContext = {
  source: FinanceExternalSource;
  receivable: FinanceExternalReceivable;
  revision: string;
  collectionPolicyVersionId: string | null;
  waiverEnabled: boolean;
  requiresApproval: boolean;
  canExecute: boolean;
  issues: string[];
  requests: FinanceOperatorPage<FinanceWaiverContextItem>;
};

export type FinanceWaiverContextInput = {
  source: FinanceExternalSource;
  action: FinanceWaiverAction;
  page?: number;
  pageSize?: number;
};

export type FinanceRefundableSource = {
  sourceAllocationId: string;
  sourceReceiptId: string;
  receiptNumber: string;
  schoolReceiptDate: string;
  paidAmount: number;
  committedAmount: number;
  availableAmount: number;
};

export type FinanceExternalRefundForm = {
  receivable: FinanceExternalReceivable;
  revision: string;
  refundPolicyVersionId: string | null;
  allowedPayoutMethods: string[];
  canRequest: boolean;
  setupIssues: string[];
  sources: FinanceRefundableSource[];
};

export type FinanceExternalRefundSelection = {
  source: FinanceExternalSource;
  revision: string;
  originalReceiptId: string;
  lines: { sourceAllocationId: string; sourceReceiptId: string; amount: string | number }[];
  method: string;
  paymentDetails?: Record<string, unknown> | null;
};

export type FinanceExternalRefundCommand = FinanceExternalRefundSelection & {
  idempotencyKey: string;
  reason: string;
};

export type FinanceExternalRefundPreview = Omit<FeeRefundPreviewDto, 'studentFeeStructureId'> & {
  studentFeeStructureId: string | null;
};

export type FinanceExternalRefundRequest = Omit<
  FeeRefundRequestDto,
  'studentId' | 'studentFeeStructureId'
> & {
  studentId: string | null;
  employeeId?: string | null;
  financeFeeAccountId?: string | null;
  financeExternalSourceLinkId?: string | null;
  payerName?: string | null;
  studentFeeStructureId?: string | null;
};
