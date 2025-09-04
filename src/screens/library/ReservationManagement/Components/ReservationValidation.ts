import * as Yup from 'yup';

export const reservationValidationSchema = Yup.object().shape({
  role: Yup.string().required('Role is required'),

  // Validate class only if role === 'Student'
  class: Yup.string().when('role', (role: unknown, schema) =>
    (role as string) === 'Student' ? schema.required('Class is required') : schema.nullable()
  ),

  // Validate division only if role === 'Student'
  division: Yup.string().when('role', (role: unknown, schema) =>
    (role as string) === 'Student' ? schema.required('Division is required') : schema.nullable()
  ),

  // Only validate member when role ≠ Student
  member: Yup.string().required('Member is required'),
  bookCategory: Yup.string().required('Book Category is required'),
  bookTitle: Yup.string().required('Book Title is required'),
  edition: Yup.string().required('Edition is required'),
});
