import * as Yup from 'yup';

export const chargeTypeValidationSchema = Yup.object().shape({
  chargeType: Yup.string().required('Charge Type is required'),
  amount: Yup.number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const cleaned = originalValue.replace(/[₹,\s]/g, '');
        return Number(cleaned);
      }
      return value;
    })
    .required('Amount is required')
    .positive('Amount must be positive')
    .min(1, 'Amount must be greater than 0'),
  description: Yup.string().nullable(),
});
