import * as Yup from 'yup';

export const bankAccountValidationSchema = Yup.object().shape({
  bankName: Yup.string().trim().required('Bank Name is required'),

  branchName: Yup.string().trim().required('Branch Name is required'),

  branchAddress: Yup.string().trim().nullable(),

  accountName: Yup.string().trim().required('Account Holder Name is required'),

  accountType: Yup.string().trim().required('Account Type is required'),

  accountNumber: Yup.string()
    .trim()
    .matches(/^[0-9]{6,18}$/, 'Account Number must be 6–18 digits')
    .required('Account Number is required'),

  accountPurpose: Yup.string().trim().nullable(),

  ifscCode: Yup.string()
    .trim()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0123456)')
    .required('IFSC code is required'),

  upiId: Yup.string()
    .trim()
    .matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID')
    .nullable(),
});
