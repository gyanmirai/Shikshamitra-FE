import * as Yup from 'yup';

export const electiveSubjectValidationSchema = Yup.object().shape({
  name: Yup.string().required('Elective Group Name is required'),
  subjectIds: Yup.array().min(2, 'At least two subjects are required'),
  color: Yup.string().required('Elective Group Color is required'),
});
