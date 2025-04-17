import * as Yup from 'yup';

export const paymentMethodValidationSchema = Yup.object({
  paymentMethodName: Yup.string().required('Payment Method name is required'),
});

export const categoryValidationSchema = Yup.object({
  categoryName: Yup.string().required('Category name is required'),
});

export const feeHeadValidationSchema = Yup.object({
  feeHeadName: Yup.string().required('Fee Head name is required'),
});
