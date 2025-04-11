import * as Yup from 'yup';

export const receiptBookValidationSchema = Yup.object().shape({
  receiptBookName: Yup.string()
    .trim()
    .required('Receipt Book Name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters'),

  receiptBookCode: Yup.string()
    .trim()
    .required('Receipt Book Code is required')
    .matches(/^[A-Za-z0-9_-]+$/, 'Invalid format')
    .max(20, 'Cannot exceed 20 characters'),
});
