import * as yup from 'yup';

export const stepValidationSchemas = [
  yup.object().shape({
    quizTitle: yup.string().required('Quiz title is required'),
    className: yup.string().required('Class name is required'),
    division: yup.array().of(yup.string()).min(1, 'At least one division is required'),
    subject: yup.string().required('Subject is required'),
    chapter: yup.array().of(yup.string()).min(1, 'At least one chapter is required'),
  }),
  yup.object().shape({
    questions: yup.array().min(1, 'At least one question is required'),
  }),
  yup.object().shape({
    attemptsAllowed: yup
      .number()
      .min(1, 'At least one attempt is required')
      .required('Attempts allowed is required'),
    passingMarks: yup
      .number()
      .min(0, 'Passing score must be at least 0')
      .max(100, 'Passing score must not exceed 100')
      .required('Passing score is required'),
    quizStartDateTime: yup.date().required('Quiz Start date is required'),
    quizEndtDateTime: yup.date().required('Quiz Start date is required'),
  }),
];
