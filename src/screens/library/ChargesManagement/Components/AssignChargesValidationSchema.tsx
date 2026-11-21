import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

const schoolDate = (label: string) =>
  Yup.mixed<Dayjs>()
    .nullable()
    .required(`${label} is required`)
    .test('valid-school-date', `${label} must be a valid date`, (value) =>
      Boolean(dayjs.isDayjs(value) && value.isValid())
    );

// Keep the existing caller signature; year context is an explicit ID, not a due-date boundary.
export const assignLibraryChargeValidationSchema = (_currentYear?: unknown) =>
  Yup.object().shape({
    memberId: Yup.string().required('Member ID is required'),
    academicYearId: Yup.string().required('Choose the assessment academic year'),

    role: Yup.string().nullable(),

    // Student-specific validations
    class: Yup.string().nullable(),

    division: Yup.string().nullable(),

    // Member required only when role ≠ Student
    member: Yup.string().nullable(),

    // Book details
    bookNumber: Yup.string().nullable(),
    requiresLoanSource: Yup.boolean(),
    bookIssueId: Yup.string().when('requiresLoanSource', {
      is: true,
      then: (rule) => rule.required('Select the recorded loan source for this borrower'),
      otherwise: (rule) => rule.nullable(),
    }),
    bookTitle: Yup.string().nullable(),

    // Charge details
    chargeCategory: Yup.string().required('Charge Category is required'),
    amount: Yup.string()
      .required('Amount is required')
      .test('positive-paise', 'Amount must be positive with at most two decimal places', (value) =>
        Boolean(
          value &&
          /^\d+(\.\d{1,2})?$/.test(value) &&
          Number.isFinite(Number(value)) &&
          Number(value) > 0
        )
      ),
    chargeDate: schoolDate('Assessment date'),
    dueDate: schoolDate('Due date').test(
      'assessment-order',
      'Due date must be on or after the assessment date',
      function ordered(value) {
        const { chargeDate } = this.parent;
        return (
          !value ||
          !dayjs.isDayjs(chargeDate) ||
          !chargeDate.isValid() ||
          value.format('YYYY-MM-DD') >= chargeDate.format('YYYY-MM-DD')
        );
      }
    ),
    reason: Yup.string().required('Reason is required'),
  });
