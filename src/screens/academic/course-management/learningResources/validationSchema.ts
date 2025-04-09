import * as Yup from 'yup';

export const validationSchema = Yup.object({
  id: Yup.number().required(),
  resourceTitle: Yup.string()
    .required('Resource Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  typeOfResource: Yup.string().required('Please select a resource type'),
  className: Yup.string().required('Class name is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  dateUploaded: Yup.string().required('Date uploaded is required'),
  status: Yup.string().oneOf(['draft', 'Publish', 'Unpublish'], 'Invalid status'),
});
