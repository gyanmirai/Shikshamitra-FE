import type { Dayjs } from 'dayjs';
import type {
  LibraryRenewRequest,
  LibraryLoanDateReviewRequest,
} from 'src/redux/library/circulation-commands';

export type LoanMaintenanceKind = 'renew' | 'reviewDates';
export type MaintenancePayload =
  | { kind: 'renew'; loanId: string; body: Omit<LibraryRenewRequest, 'idempotencyKey'> }
  | {
      kind: 'reviewDates';
      loanId: string;
      body: Omit<LibraryLoanDateReviewRequest, 'idempotencyKey'>;
    };
export type RenewalValues = {
  schoolRenewalDate: Dayjs | null;
  requestedDueDate: Dayjs | null;
  academicYearId: string;
  reason: string;
  calendarChangeReason: string;
};
export const reviewDateFields = [
  'schoolIssueDate',
  'schoolDueDate',
  'originalSchoolDueDate',
  'schoolReturnDate',
] as const;
export type ReviewDateField = (typeof reviewDateFields)[number];
export type DateReviewValues = Record<ReviewDateField, Dayjs | null> & { reason: string };
