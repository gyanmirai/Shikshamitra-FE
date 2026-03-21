import * as Yup from 'yup';

export const homeworkContentValidationSchema = Yup.object().shape({
  content: Yup.string().required('Content is required'),
});

export const homeworkFileValidationSchema = Yup.object().shape({
  submission: Yup.array().min(1, 'At least one file is required'),
});

export const assignmentContentValidationSchema = Yup.object().shape({
  content: Yup.string().required('Content is required'),
});

export const assignmentFileValidationSchema = Yup.object().shape({
  submission: Yup.array().min(1, 'At least one file is required'),
});
