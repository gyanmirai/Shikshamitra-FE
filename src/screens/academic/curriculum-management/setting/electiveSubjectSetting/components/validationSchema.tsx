import * as Yup from 'yup';

export const electiveSubjectValidationSchema = Yup.object().shape({
  title: Yup.string().required('Elective Group Name is required'),
  subjects: Yup.array().min(1, 'At least one subject is required'),
  subjectColor: Yup.string().required('Elective Group Color is required'),
});
