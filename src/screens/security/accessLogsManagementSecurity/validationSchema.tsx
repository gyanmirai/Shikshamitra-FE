import * as Yup from 'yup';

export const AccessLogsDenyValidationSchema = Yup.object().shape({
  notes: Yup.string()
    .required('Notes are required')
    .min(10, 'Notes must be at least 10 characters')
    .max(500, 'Notes must be at most 500 characters'),
});
