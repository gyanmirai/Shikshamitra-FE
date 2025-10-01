import * as Yup from 'yup';

export const chargeTypeValidationSchema = Yup.object().shape({
  chargeType: Yup.string().required('Category Name is required'),
  isFixed: Yup.boolean(),
  amount: Yup.number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const cleaned = originalValue.replace(/[₹,\s]/g, '');
        // If cleaned value is not a valid number, return undefined
        // eslint-disable-next-line no-restricted-globals
        if (!cleaned || isNaN(Number(cleaned))) {
          return undefined;
        }
        return Number(cleaned);
      }
      return value;
    })
    .when('isFixed', {
      is: true,
      then: (schema) =>
        schema
          .required('Amount is required')
          .positive('Amount must be positive')
          .min(1, 'Amount must be greater than 0'),
      otherwise: (schema) => schema.notRequired(),
    }),
  description: Yup.string().nullable(),
});
