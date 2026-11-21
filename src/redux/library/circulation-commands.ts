import type { LibraryIssuePlanRequest } from './circulation-types';

export type LibraryCommandAttempt = { idempotencyKey: string; revision: string };
export type LibraryCheckoutRequest = LibraryIssuePlanRequest &
  LibraryCommandAttempt & {
    remarks?: string | null;
  };
export type LibraryReturnAssessment = {
  chargeCategoryId: string;
  academicYearId?: string | null;
  academicYearReason?: string | null;
  amount: number;
  schoolChargeDate: string;
  schoolDueDate: string;
  reason: string;
};
export type LibraryLoanReturnRequest = LibraryCommandAttempt & {
  copyId: string;
  schoolReturnDate: string;
  copyStatus: number;
  remarks?: string | null;
  unknownOriginalDatesReason?: string | null;
  assessments: LibraryReturnAssessment[];
};
export type LibraryRenewalPlanRequest = {
  academicYearId?: string | null;
  schoolRenewalDate: string;
  requestedDueDate?: string | null;
};
export type LibraryRenewRequest = LibraryRenewalPlanRequest &
  LibraryCommandAttempt & {
    calendarChangeReason?: string | null;
    reason?: string | null;
  };
export type LibraryLoanDateReviewRequest = LibraryCommandAttempt & {
  schoolIssueDate?: string | null;
  schoolDueDate?: string | null;
  originalSchoolDueDate?: string | null;
  schoolReturnDate?: string | null;
  reason: string;
};
