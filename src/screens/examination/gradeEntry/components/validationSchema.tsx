import * as yup from 'yup';

export const validationSchema = yup.object().shape({
  grade: yup.string().required('Grade is required'),
  feedback: yup.string().max(500, 'Feedback must be less than 500 characters'),
});
