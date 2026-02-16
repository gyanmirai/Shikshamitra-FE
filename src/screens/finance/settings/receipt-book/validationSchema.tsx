import * as Yup from 'yup';

export const receiptBookValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Receipt Book Name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters'),
  boardId: Yup.string().trim().required('Board is required'),

  mediumId: Yup.string().trim().required('Medium is required'),

  mediumStageId: Yup.string().trim().required('Organization is required'),
  prefix: Yup.string()
    .trim()
    .nullable()
    .matches(/^[A-Za-z0-9]+$/, 'Only letters and numbers allowed')
    .max(10, 'Cannot exceed 10 characters'),

  suffix: Yup.string()
    .trim()
    .nullable()
    .matches(/^[A-Za-z0-9]+$/, 'Only letters and numbers allowed')
    .max(10, 'Cannot exceed 10 characters'),

  startingNumber: Yup.number().nullable().min(1, 'Must be greater than 0'),

  endingNumber: Yup.number()
    .nullable()
    .moreThan(Yup.ref('startingNumber'), 'Ending Number must be greater than Starting Number'),

  description: Yup.string().trim().max(200, 'Description cannot exceed 200 characters').nullable(),
});
