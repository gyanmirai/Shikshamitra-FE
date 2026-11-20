import type { LibraryLoan } from 'src/redux/library/circulation-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { schoolDate, confirmedDate } from './school-date';
import { eligibleReviewFields } from './loan-review-fields';

import type { DateReviewValues } from './loan-maintenance-types';

const date = () =>
  Yup.mixed()
    .nullable()
    .test(
      'civil-date',
      'Choose a valid school date.',
      (value) => !value || (dayjs.isDayjs(value) && Boolean(schoolDate(value)))
    );
const requiredDate = () => date().required('Enter the school date.');
export const manualRenewal = (loan: LibraryLoan) =>
  Boolean(loan.policy?.isLegacyManualDate || loan.policy?.terms.dueDateMode === 0);
export function renewalSchema(loan: LibraryLoan) {
  return Yup.object({
    schoolRenewalDate: requiredDate(),
    requestedDueDate: manualRenewal(loan)
      ? requiredDate().test(
          'extends-due',
          'The new due date must extend the saved due date and cover the renewal date.',
          function extendsDue(value) {
            const due = dayjs.isDayjs(value) ? schoolDate(value) : null;
            const renewal = dayjs.isDayjs(this.parent.schoolRenewalDate)
              ? schoolDate(this.parent.schoolRenewalDate)
              : null;
            const previous = confirmedDate(loan.schoolDueDate, loan.dueDateProvenance)
              ? loan.schoolDueDate
              : null;
            return !due || ((!previous || due > previous) && (!renewal || due >= renewal));
          }
        )
      : date(),
    academicYearId:
      loan.role === 1 ? Yup.string().required('Select the renewal academic year.') : Yup.string(),
    reason: Yup.string().max(500),
    calendarChangeReason: Yup.string().max(500),
  });
}
export function reviewSchema(loan: LibraryLoan) {
  const fields = eligibleReviewFields(loan);
  return Yup.object({
    schoolIssueDate: date(),
    schoolDueDate: date(),
    originalSchoolDueDate: date(),
    schoolReturnDate: date(),
    reason: Yup.string()
      .trim()
      .required('Explain the school evidence used to confirm these dates.')
      .max(500),
  }).test('review-date', 'Enter at least one eligible school date.', function hasReviewDate(value) {
    if (fields.some((field) => dayjs.isDayjs(value[field]) && schoolDate(value[field])))
      return true;
    return this.createError({
      path: fields[0] || 'reason',
      message: 'Enter at least one eligible school date.',
    });
  });
}
export function reviewRangeError(loan: LibraryLoan, values: DateReviewValues) {
  const known = (value: string | null, provenance: number) =>
    confirmedDate(value, provenance) ? value : null;
  const issue =
    schoolDate(values.schoolIssueDate) || known(loan.schoolIssueDate, loan.issueDateProvenance);
  const due = schoolDate(values.schoolDueDate) || known(loan.schoolDueDate, loan.dueDateProvenance);
  const returned =
    schoolDate(values.schoolReturnDate) || known(loan.schoolReturnDate, loan.returnDateProvenance);
  const original = schoolDate(values.originalSchoolDueDate);
  return (issue &&
    ((due && due < issue) || (returned && returned < issue) || (original && original < issue))) ||
    (original && due && original > due)
    ? 'Review the school date order: the issue date must precede the due and return dates, and the original due date cannot exceed the current due date.'
    : '';
}
