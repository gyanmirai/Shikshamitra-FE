import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { canonicalLoan, canonicalCopy } from './canonical-test-fixtures';

export const maintenanceTarget = { loanId: canonicalLoan.id, copyId: canonicalLoan.copyId };
export const maintenanceLoan = {
  ...canonicalLoan,
  status: 0,
  role: 1,
  academicYearId: 'recorded-year',
  schoolIssueDate: '2026-11-17',
  schoolDueDate: '2026-11-24',
  originalSchoolDueDate: '2026-11-24',
  issueDateProvenance: 1,
  dueDateProvenance: 1,
  rawIssueDate: null,
  rawDueDate: null,
  canRenew: true,
  canReviewDates: false,
  policy: {
    policyId: 'policy-family',
    policyVersionId: 'saved-policy',
    version: 1,
    isLegacyManualDate: false,
    role: 1,
    terms: {
      dueDateMode: 0,
      maxBooksAtTime: 4,
      reservationLimit: 2,
      maxRenewals: 2,
      loanDays: null,
      dayCountingMode: null,
      renewalDays: null,
      pickupWindowDays: null,
      moveDueDateToNextOpenDay: null,
    },
    timeZoneId: null,
    timeZoneSource: 'Unconfigured',
    needsCalendarConfiguration: false,
  },
  schoolContext: {
    ...canonicalCopy.schoolContext,
    academicYears: [
      { id: 'renewal-year', name: '2027–2028' },
      { id: 'recorded-year', name: '2026–2027' },
    ],
  },
} satisfies LibraryLoan;
export const reviewableReturn = {
  ...maintenanceLoan,
  status: 1,
  canRenew: false,
  canReviewDates: true,
  rawReturnDate: '2026-11-18T00:00:00',
  schoolReturnDate: null,
  returnDateProvenance: 0,
} satisfies LibraryLoan;
export function renewalPreview(body: Record<string, unknown>) {
  return {
    loan: maintenanceLoan,
    currentAcademicYearId: body.academicYearId || 'renewal-year',
    schoolRenewalDate: body.schoolRenewalDate,
    newSchoolDueDate: body.requestedDueDate || '2026-12-01',
    currentSchoolTimeZoneId: null,
    requiresCalendarChangeAcknowledgment: false,
    canRenew: Boolean(body.schoolRenewalDate && body.requestedDueDate),
    blockedReasons: [],
    revision: 'reviewed-renewal-plan',
  };
}
