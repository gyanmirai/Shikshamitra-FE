import * as Yup from 'yup';

export const reviewStaffGatePassRequestValidationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
});
