import * as Yup from 'yup';

export const surveyTypeValidationSchema = Yup.object().shape({
  surveyType: Yup.string().trim().required('Survey Type is required'),
  description: Yup.string().nullable(),
});
