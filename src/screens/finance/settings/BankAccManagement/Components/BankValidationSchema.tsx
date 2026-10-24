import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

// Match the common MUI picker's inclusive supported range for typed dates too.
export const bankAccountDateBounds = {
  minDate: dayjs('1900-01-01'),
  maxDate: dayjs('2099-12-31'),
};

const effectiveDate = (label: string) =>
  Yup.mixed<Dayjs>()
    .nullable()
    .test(
      'valid-date',
      `${label} must be a valid date (DD/MM/YYYY)`,
      (value, context) =>
        !context.parent[`${context.path}Incomplete`] &&
        (value == null || (dayjs.isDayjs(value) && value.isValid()))
    )
    .test('date-range', `${label} must be between 01/01/1900 and 31/12/2099`, (value) => {
      if (!dayjs.isDayjs(value) || !value.isValid()) return true;
      return (
        !value.isBefore(bankAccountDateBounds.minDate, 'day') &&
        !value.isAfter(bankAccountDateBounds.maxDate, 'day')
      );
    });

export const bankAccountValidationSchema = Yup.object().shape({
  bankName: Yup.string()
    .trim()
    .max(100, 'Bank Name must be at most 100 characters')
    .required('Bank Name is required'),

  branchName: Yup.string()
    .trim()
    .max(100, 'Branch Name must be at most 100 characters')
    .required('Branch Name is required'),

  branchAddress: Yup.string().trim().nullable(),

  accountHolderName: Yup.string()
    .trim()
    .max(100, 'Account Holder Name must be at most 100 characters')
    .required('Account Holder Name is required'),
  accountType: Yup.number()
    .oneOf([0, 1], 'Select Saving or Current')
    .required('Account Type is required'),

  accountNumber: Yup.string()
    .trim()
    .matches(/^[0-9]{6,18}$/, 'Account Number must be 6–18 digits')
    .required('Account Number is required'),

  purpose: Yup.string()
    .trim()
    .max(500, 'Account Purpose must be at most 500 characters')
    .nullable(),

  ifscCode: Yup.string()
    .trim()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0123456)')
    .required('IFSC code is required'),

  upiId: Yup.string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID. Example: prerna123@paytm')
    .nullable(),
  effectiveFromIncomplete: Yup.boolean(),
  effectiveToIncomplete: Yup.boolean(),
  effectiveFrom: effectiveDate('Effective from').required('Effective from is required'),
  effectiveTo: effectiveDate('Effective to').test(
    'date-order',
    'Effective to must be on or after effective from',
    (value, context) => {
      const { effectiveFrom } = context.parent;
      if (
        !dayjs.isDayjs(value) ||
        !value.isValid() ||
        !dayjs.isDayjs(effectiveFrom) ||
        !effectiveFrom.isValid()
      )
        return true;
      return !value.isBefore(effectiveFrom, 'day');
    }
  ),
});
