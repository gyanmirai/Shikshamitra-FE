import * as Yup from 'yup';

export const examTypeValidationSchema = Yup.object().shape({
  examType: Yup.string().required('Exam type is required'),
});

export const assessmentTypeValidationSchema = Yup.object().shape({
  assessmentType: Yup.string()
    .required('Assessment type is required')
    .max(50, 'Assessment type must be at most 50 characters'),
});
