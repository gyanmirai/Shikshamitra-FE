import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  subjectCode: Yup.string().required('Subject Code is Required'),
  subjectName: Yup.string().required('Subject Name is required'),
  className: Yup.string().required('Class is required'),
  primaryTeacher: Yup.string().when('status', {
    is: 'Publish',
    then: (schema) => schema.required('Primary Teacher is required when status is Publish'),
    otherwise: (schema) => schema.notRequired(),
  }),
  secondaryTeacher: Yup.array(), // Changed to array
  learningGoal: Yup.string(),
  prerequisites: Yup.string(),
  description: Yup.string(),
  subjectColor: Yup.string().required('Subject Color is required'),
  status: Yup.string(),
});
