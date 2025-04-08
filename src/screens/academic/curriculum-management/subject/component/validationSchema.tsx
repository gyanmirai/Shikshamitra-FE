import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  subjectCode: Yup.string().required('Subject Code is Required'),
  subjectName: Yup.string().required('Subject Name is required'),
  className: Yup.string().required('Class is required'),
  primaryTeacher: Yup.string().required('Primary teacher is required'),
  secondaryTeacher: Yup.array().of(Yup.string()).required('Assigned Teacher is required'), // Changed to array
  learningGoal: Yup.string().required('Learning Goal is required'),
  prerequisites: Yup.string().required('Prerequisites are required'),
  description: Yup.string().required('Description is required'),
  subjectColor: Yup.string().required('Subject Color is required'),
  scheduleDate: Yup.date().required('Schedule Date is required'),
});
