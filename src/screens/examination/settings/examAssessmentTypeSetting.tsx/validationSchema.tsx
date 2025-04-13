import * as Yup from 'yup';

export const examTypeValidationSchema = Yup.object().shape({
  examType: Yup.string().required('Exam type is required'),
  description: Yup.string().required('Description is required'),
});

export const assessmentTypeValidationSchema = Yup.object().shape({
  assessmentType: Yup.string()
    .required('Assessment type is required')
    .max(50, 'Assessment type must be at most 50 characters'),
  description: Yup.string()
    .required('Description is required')
    .max(300, 'Description must be at most 300 characters'),
});
