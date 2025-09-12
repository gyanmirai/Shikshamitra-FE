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

  prefix: Yup.string()
    .trim()
    .required('Prefix is required')
    .matches(/^[A-Za-z0-9]+$/, 'Only letters and numbers allowed')
    .max(10, 'Cannot exceed 10 characters'),

  suffix: Yup.string()
    .trim()
    .required('Suffix is required')
    .matches(/^[A-Za-z0-9]+$/, 'Only letters and numbers allowed')
    .max(10, 'Cannot exceed 10 characters'),

  startingNumber: Yup.number()
    .required('Starting Number is required')
    .min(1, 'Must be greater than 0'),

  endingNumber: Yup.number()
    .required('Ending Number is required')
    .moreThan(Yup.ref('startingNumber'), 'Ending Number must be greater than Starting Number'),

  description: Yup.string().trim().max(200, 'Description cannot exceed 200 characters').nullable(),
});
