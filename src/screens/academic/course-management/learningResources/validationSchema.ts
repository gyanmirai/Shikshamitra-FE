import * as Yup from 'yup';

export const validationSchema = Yup.object({
  id: Yup.number().required(),
  resourceTitle: Yup.string()
    .required('Resource Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  className: Yup.string().required('Class name is required'),
  subject: Yup.string().required('Subject is required'),
  dateUploaded: Yup.string().required('Date uploaded is required'),
});
