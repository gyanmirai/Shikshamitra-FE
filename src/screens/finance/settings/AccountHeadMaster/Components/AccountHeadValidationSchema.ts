import * as Yup from 'yup';

export const AccountHeadValidationSchema = Yup.object().shape({
  headName: Yup.string()
    .required('Head Name is required')
    .min(3, 'Head Name must be at least 3 characters')
    .max(100, 'Head Name must be at most 100 characters'),
  headType: Yup.string().required('Head Type is required'),
  linkedSources: Yup.array()
    .min(1, 'At least one linked source is required')
    .required('Linked Source is required'),
  openingBalance: Yup.number().nullable(),
  notes: Yup.string().nullable(),
  isActive: Yup.boolean(),
});
