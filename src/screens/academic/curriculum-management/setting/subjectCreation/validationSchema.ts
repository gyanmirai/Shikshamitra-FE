import * as Yup from 'yup';

export const subjectValidationSchema = Yup.object({
  subjectName: Yup.string().required('Subject name is required'),
  subjectColor: Yup.string().required('Subject color is required'),
});
