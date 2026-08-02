import * as Yup from 'yup';

export const subjectValidationSchema = Yup.object({
  subjectName: Yup.string()
    .trim()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s]+$/, 'Please enter a valid subject name using letters and numbers')
    .required('Subject Name is required'),
  displayName: Yup.string()
    .trim()
    .max(50, 'Display name cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s]*$/, 'Please enter a valid display name using letters and numbers'),
  category: Yup.string().trim().required('Subject category is required'),
  subjectColor: Yup.string().required('Subject color is required'),
  icon: Yup.string().trim().max(50, 'Icon cannot exceed 50 characters'),
  description: Yup.string().trim().max(500, 'Description cannot exceed 500 characters'),
  sortOrder: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .min(1, 'Sort order must be at least 1')
    .max(999999, 'Sort order cannot exceed 999999')
    .nullable(),
});
