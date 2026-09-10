import * as Yup from 'yup';

export const AccountHeadValidationSchema = Yup.object().shape({
  headName: Yup.string()
    .required('Head Name is required')
    .min(3, 'Head Name must be at least 3 characters')
    .max(128, 'Head Name must be at most 128 characters'),
  headType: Yup.string().required('Head Type is required'),
  notes: Yup.string().max(1000).nullable(),
});
