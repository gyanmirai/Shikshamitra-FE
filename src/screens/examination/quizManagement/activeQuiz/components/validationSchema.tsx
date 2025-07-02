import * as yup from 'yup';

export const stepValidationSchemas = [
  yup.object().shape({
    attemptsAllowed: yup.number(),

    quizStartDateTime: yup.date().required('Start Date/Time is required'),
    totalMarks: yup.number().required('Total Marks is required'),
    passingMarks: yup
      .number()
      .required('Passing Marks is required')
      .min(0, 'Passing Marks cannot be negative')
      .max(yup.ref('totalMarks'), 'Cannot exceed total marks'),
    quizTakenType: yup.string().required('Quiz Taken Type is Required'),
    quizEndDateTime: yup
      .date()
      .required('End Date/Time is required')
      .min(yup.ref('quizStartDateTime'), 'End date must be after start date'),
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
