import type { LibraryLoan } from 'src/redux/library/circulation-types';

import dayjs from 'dayjs';

import { schoolDate, confirmedDate } from './school-date';
import { reviewDateFields } from './loan-maintenance-types';

import type { ReviewDateField, DateReviewValues } from './loan-maintenance-types';

export const reviewDateLabels: Record<ReviewDateField, string> = {
  schoolIssueDate: 'School issue date',
  schoolDueDate: 'School due date',
  originalSchoolDueDate: 'Original school due date',
  schoolReturnDate: 'School return date',
};
export function eligibleReviewFields(loan: LibraryLoan): ReviewDateField[] {
  return reviewDateFields.filter((field) => {
    if (field === 'originalSchoolDueDate') return !loan.originalSchoolDueDate;
    if (field === 'schoolReturnDate') return loan.status === 1 && loan.returnDateProvenance !== 1;
    return (field === 'schoolIssueDate' ? loan.issueDateProvenance : loan.dueDateProvenance) !== 1;
  });
}
export function initialReviewValues(loan: LibraryLoan): DateReviewValues {
  const initial = (field: ReviewDateField, provenance: number) =>
    confirmedDate(loan[field], provenance) ? dayjs(loan[field]) : null;
  return {
    reason: '',
    schoolIssueDate: initial('schoolIssueDate', loan.issueDateProvenance),
    schoolDueDate: initial('schoolDueDate', loan.dueDateProvenance),
    originalSchoolDueDate: null,
    schoolReturnDate: initial('schoolReturnDate', loan.returnDateProvenance),
  };
}
export function reviewDateBody(loan: LibraryLoan, values: DateReviewValues) {
  const dates: Partial<Record<ReviewDateField, string>> = {};
  eligibleReviewFields(loan).forEach((field) => {
    const value = schoolDate(values[field]);
    if (value) dates[field] = value;
  });
  return { ...dates, reason: values.reason, revision: loan.revision };
}
