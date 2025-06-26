import * as yup from 'yup';

export const stepValidationSchemas = [
  yup.object().shape({
    attemptsAllowed: yup.number(),
    passingMarks: yup
      .number()
      .min(0, 'Passing score must be at least 0')
      .max(100, 'Passing score must not exceed 100')
      .required('Passing score is required'),
    quizStartDateTime: yup.date().required('Start Date/Time is required'),
    quizTakenType: yup.string().required('Quiz Taken Type is Required'),
    quizEndDateTime: yup.date().required('End Date/Time is required'),
    quizTitle: yup.string().required('Title is required'),
    className: yup.string().required('Class is required'),
    division: yup.array().of(yup.string()).min(1, 'At least one Division is required'),
    subject: yup.string().required('Subject is required'),
    chapter: yup.array().of(yup.string()).min(1, 'At least one Chapter is required'),
  }),
  yup.object().shape({
    questions: yup.array().when('isQuestionUpload', {
      is: false,
      then: (schema) => schema.min(1, 'At least one question is required'),
    }),
  }),
];
