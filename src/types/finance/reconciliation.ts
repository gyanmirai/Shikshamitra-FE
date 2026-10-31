// ── Enums ──────────────────────────────────────────────────────────────────────

/** Maps to FeeReceiptVerificationStatus on backend. */
export enum ReconciliationVerificationStatus {
  NotApplicable = 0,
  PendingVerification = 1,
  Verified = 2,
  Rejected = 3,
}

/**
 * Simplified 3-state status shown in the FE.
 * 0=Pending, 1=Approved, 2=Rejected.
 * Matches PaymentMethodsStatusType enum.
 */
export enum ReconciliationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface GetReconciliationListParams {
  academicYearId: string;
  month?: number;
  year?: number;
  /** API method name or enum number; active tabs pass ReconciliationStatusType values. */
  paymentMethod?: string | number;
  /** Optional status filter: 1=PendingVerification, 2=Verified, 3=Rejected */
  status?: ReconciliationVerificationStatus;
  search?: string;
  /** Serialized Finance table column criteria. */
  filters?: string;
  page?: number;
  pageSize?: number;
}

// ── List item ──────────────────────────────────────────────────────────────────

export interface ReconciliationListItemDto {
  receiptScope?: 'Fee' | 'Charge' | 'Combined';
  paymentReceiptCount?: number;
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  grNumber: number | null;
  rollNumber: number | null;
  board: string;
  medium: string;
  class: string;
  division: string;
  feeCollectionTransactionId: string;
  paymentMethod: number;
  paymentMethodLabel: string;
  amount: number;
  /** Validated receiving school bank and its masked label recorded at collection. */
  bankAccountId?: string | null;
  bankLabel?: string | null;
  /** Instrument-specific fields: chequeNumber, bankName, transactionId, etc. */
  instrumentDetails: Record<string, string | null>;
  /** 0=Pending, 1=Approved, 2=Rejected */
  status: ReconciliationStatus;
  statusLabel: string;
  verificationStatus: ReconciliationVerificationStatus;
  finalReceiptNumber: string | null;
  receiptDate: string;
  /** Recorded collection date; DD instrument details can contain the entered payment date. */
  paymentDate?: string | null;
  actedBy: string | null;
  actedByName: string | null;
  actedOn: string | null;
  remarks: string | null;
}

// ── Tab counts ─────────────────────────────────────────────────────────────────

export interface ReconciliationTabCountsDto {
  cashOfficial?: number;
  totalPending: number;
  chequePending: number;
  chequeApproved: number;
  chequeRejected: number;
  demandDraftPending: number;
  demandDraftApproved: number;
  demandDraftRejected: number;
  bankTransferPending: number;
  bankTransferApproved: number;
  bankTransferRejected: number;
  creditCardPending: number;
  creditCardApproved: number;
  creditCardRejected: number;
  upiPending: number;
  upiApproved: number;
  upiRejected: number;
  onlineGatewayPending: number;
  onlineGatewayApproved: number;
  onlineGatewayRejected: number;
  walletPending: number;
  walletApproved: number;
  walletRejected: number;
}

// ── List response ──────────────────────────────────────────────────────────────

export interface ReconciliationListResponse {
  success: boolean;
  items: ReconciliationListItemDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  tabCounts: ReconciliationTabCountsDto;
  message: string;
}

// ── Action inputs ──────────────────────────────────────────────────────────────

export interface ApproveReconciliationInput {
  remarks?: string;
}

export interface RejectReconciliationInput {
  remarks: string;
}

// ── Action response ────────────────────────────────────────────────────────────

export interface ReconciliationActionData {
  receiptId: string;
  verificationStatus: ReconciliationVerificationStatus;
  /** 0=Pending, 1=Approved, 2=Rejected */
  status: ReconciliationStatus;
  statusLabel: string;
  finalReceiptNumber: string | null;
  actedBy: string;
  actedByName: string;
  actedOn: string;
  remarks: string | null;
}

export interface ReconciliationActionResponse {
  success: boolean;
  data: ReconciliationActionData | null;
  message: string;
}
