import * as yup from 'yup';

export const validationSchema = yup.object().shape({
  surveyTitle: yup.string().min(1, 'Survey title is required').required('Survey title is required'),
  description: yup.string().required('Description is required'),
  surveyType: yup.string().required('Survey type is required'),
  audience: yup
    .array()
    .of(yup.string())
    .min(1, 'Audience is required')
    .required('Audience is required'),
  className: yup
    .array()
    .of(yup.string())
    .min(1, 'Class name is required')
    .required('Class name is required'),
  organization: yup
    .array()
    .of(yup.string())
    .min(1, 'Organization is required')
    .required('Organization is required'),
  questions: yup
    .array()
    .of(
      yup.object().shape({
        question: yup.string().required('Question is required'),
        type: yup.string().required('Question type is required'),
        options: yup.array().of(yup.string()).min(1, 'At least one option is required'),
      })
    )
    .min(1, 'At least one question is required')
    .required('Questions are required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
});
