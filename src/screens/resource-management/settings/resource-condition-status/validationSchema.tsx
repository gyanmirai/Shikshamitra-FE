import * as Yup from 'yup';

export const resourceConditionStatusValidationSchema = Yup.object().shape({
  resourceConditionStatusName: Yup.string().required('Condition status name is required'),
  resourceConditionStatusDescription: Yup.string().required('Description is required'),
});
