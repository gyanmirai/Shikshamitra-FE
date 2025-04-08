import * as yup from 'yup';

export const validationSchema = [
  yup.object().shape({
    surveyTitle: yup
      .string()
      .min(1, 'Survey title is required')
      .required('Survey title is required'),
    organization: yup
      .array()
      .of(yup.string())
      .min(1, 'Organization is required')
      .required('Organization is required'),
    className: yup
      .array()
      .of(yup.string())
      .min(1, 'Class name is required')
      .required('Class name is required'),

    audience: yup
      .array()
      .of(yup.string())
      .min(1, 'Audience is required')
      .required('Audience is required'),

    description: yup.string().required('Description is required'),
  }),

  yup.object().shape({
    questions: yup.array().min(1, 'At least one question is required'),
  }),

  yup.object().shape({
    startDate: yup.date().required('Start date is required'),
    endDate: yup
      .date()
      .required('End date is required')
      .min(yup.ref('startDate'), 'End date must be after start date'),
  }),
];
