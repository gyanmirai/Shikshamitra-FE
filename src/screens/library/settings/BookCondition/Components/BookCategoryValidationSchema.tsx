import * as Yup from 'yup';

export const bookConditionValidationSchema = Yup.object().shape({
  conditionType: Yup.string().required('Book Condition Type Name is required'),
  code: Yup.string()
    .required('Code is required')
    .matches(/^[A-Z0-9\-_]+$/, 'Code must be uppercase and alphanumeric'),
  description: Yup.string().nullable(),
});
