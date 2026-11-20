import type { LibraryPolicySnapshot } from './policy-types';

export type ReservationContext = { academicYearId: string };
export type ReservationIdentity = ReservationContext & { reservationId: string };
export type ReservationPickup = { sectionId: string; campusId: string; label: string };
export type ReservationMember = {
  id: string;
  memberName?: string | null;
  memberIdentifier?: string | null;
  classDivision?: string | null;
  role: number;
  academicYearId?: string | null;
  isEligibleForReservation: boolean;
  ineligibilityReason?: string | null;
};
export type LibraryReservation = {
  id: string;
  bookId: string;
  pickupSectionId?: string | null;
  pickupCampusId?: string | null;
  pickupLabel?: string | null;
  memberId: string;
  memberName?: string | null;
  memberIdentifier?: string | null;
  classDivision?: string | null;
  role?: number | null;
  academicYearId?: string | null;
  state: number;
  legacyRequestedDate?: string | null;
  legacyReserveDueDate?: string | null;
  requestedDate?: string | null;
  requestExpiryDate?: string | null;
  requestedDateProvenance: number;
  requestExpiryDateProvenance: number;
  requiresReview: boolean;
  reviewReason?: string | null;
  revision: string;
  canCancel: boolean;
  canReview: boolean;
  hold?: {
    id: string;
    copyId: string;
    accessionNumber: string;
    state: number;
    allocatedAt: string;
    pickupDeadline?: string | null;
    pickupDeadlineProvenance: number;
    timeZoneId?: string | null;
    relatedLoanId?: string | null;
  } | null;
  policy?: LibraryPolicySnapshot | null;
};
export type ReservationCreate = ReservationContext & {
  bookId: string;
  memberId: string;
  requestedDate: string;
  requestExpiryDate?: string;
  pickupSectionId?: string;
};
export type ReservationAction = ReservationContext & { reason: string; revision: string };
export type ReservationReview = ReservationAction &
  Omit<ReservationCreate, 'bookId' | 'pickupSectionId'>;
export type ReservationPreview = {
  canonicalMemberId?: string | null;
  academicYearId?: string | null;
  policy?: LibraryPolicySnapshot | null;
  requiresExplicitExpiry: boolean;
  canCreate: boolean;
  blockedReasons: string[];
};
export type ReservationReviewPreview = Omit<ReservationPreview, 'canCreate'> & {
  reservationId: string;
  canReview: boolean;
};
export type ReservationReviewPreviewRequest = Omit<ReservationReview, 'reason'>;
export type ReservationEvent = {
  id: string;
  sequence: number;
  eventType: string;
  holdId?: string | null;
  copyId?: string | null;
  loanId?: string | null;
  previousState: number;
  nextState: number;
  actorKind: number;
  actorId?: string | null;
  systemPurpose?: number | null;
  reason: string;
  occurredAt: string;
};
