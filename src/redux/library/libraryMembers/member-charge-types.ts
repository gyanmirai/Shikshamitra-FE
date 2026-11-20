import type { LibraryPaginatedList } from '../library-adapters';

export interface MemberChargeAmounts {
  originalAmountText: string;
  acceptedAmountText: string;
  settledAmountText: string;
  pendingVerificationAmountText: string;
  netWaivedAmountText: string;
  financialOutstandingAmountText: string;
  collectibleAmountText: string;
  refundedAmountText: string;
}
export interface MemberChargePosition {
  evidence: 0 | 1 | 2;
  approvalStatus: number | null;
  currency: string | null;
  amounts: MemberChargeAmounts | null;
  reviewIssues: string[];
}
export interface MemberChargeRecord {
  id: string;
  bookId?: string | null;
  copyId?: string | null;
  copyLinkSource?: 'CopyId' | 'LegacyAccessionCandidate' | 'Unavailable';
  requiresCopyReconciliation?: boolean;
  bookTitle?: string | null;
  bookCategory?: string | null;
  accessionNo?: string | null;
  amount?: number | null;
  amountText?: string | null;
  recordedCurrency?: string | null;
  academicYearId?: string | null;
  academicYearProvenance?: number;
  date?: string | null;
  schoolChargeDate?: string | null;
  schoolDueDate?: string | null;
  chargeDateProvenance?: number;
  dueDateProvenance?: number;
  chargeType?: string;
  reason?: string | null;
  paymentStatus?: number;
  financePosition?: MemberChargePosition | null;
}
export type MemberChargePage = LibraryPaginatedList<MemberChargeRecord>;
