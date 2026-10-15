import * as Yup from 'yup';

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
  effectiveFrom: Yup.date().required('Effective from is required'),
  effectiveTo: Yup.date()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .min(Yup.ref('effectiveFrom'), 'Effective to must be on or after effective from'),
});
