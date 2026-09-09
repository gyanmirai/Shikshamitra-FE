import * as Yup from 'yup';

export const bankAccountValidationSchema = Yup.object().shape({
  code: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9._-]+$/, 'Use letters, numbers, dot, dash or underscore')
    .max(32)
    .required('Code is required'),
  bankName: Yup.string().trim().required('Bank Name is required'),

  branchName: Yup.string().trim().required('Branch Name is required'),

  branchAddress: Yup.string().trim().nullable(),

  accountHolderName: Yup.string().trim().required('Account Holder Name is required'),
  accountType: Yup.number().required('Account Type is required'),

  accountNumber: Yup.string()
    .trim()
    .matches(/^[0-9]{6,18}$/, 'Account Number must be 6–18 digits')
    .required('Account Number is required'),

  purpose: Yup.string().trim().nullable(),

  ifscCode: Yup.string()
    .trim()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0123456)')
    .required('IFSC code is required'),

  upiId: Yup.string()
    .trim()
    .matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID. Example: prerna123@paytm')
    .nullable(),

  accountHeadId: Yup.string().required('Asset account head is required'),
  effectiveFrom: Yup.date().required('Effective from is required'),
  effectiveTo: Yup.date()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .min(Yup.ref('effectiveFrom'), 'Effective to must be after effective from'),
});
