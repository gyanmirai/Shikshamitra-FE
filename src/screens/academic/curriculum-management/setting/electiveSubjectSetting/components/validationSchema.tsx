import * as Yup from 'yup';

export const electiveSubjectValidationSchema = Yup.object().shape({
  title: Yup.string().required('Elective Group Name is required'),
  subjects: Yup.array().min(2, 'At least two subjects are required'),
  subjectColor: Yup.string().required('Elective Group Color is required'),
});
