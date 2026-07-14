import * as Yup from 'yup';

export const validationSchema = Yup.object({
  id: Yup.string(),
  resourceTitle: Yup.string()
    .required('Resource Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  className: Yup.string().required('Class name is required'),
  subject: Yup.string().required('Subject is required'),
  chapter: Yup.string().required('Chapter is required'),
  dateUploaded: Yup.string(),
  document: Yup.mixed()
    .required('Document is required')
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return true; // Skip validation if no file
      if (typeof value === 'string') return true; // Accept strings
      // For file objects, check if it's a valid File instance
      return value instanceof File;
    }),
});
