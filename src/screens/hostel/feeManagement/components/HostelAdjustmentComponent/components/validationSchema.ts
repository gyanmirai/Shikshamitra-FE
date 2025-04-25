import * as Yup from 'yup';

export const hostelAdjustmentValidationSchema = Yup.object({
  amount: Yup.number().required('Amount is required'),
  type: Yup.string().required('Type is required'),
  reason: Yup.string().required('Reason is required'),
});
