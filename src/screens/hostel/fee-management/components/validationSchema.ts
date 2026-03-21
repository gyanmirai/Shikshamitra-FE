import * as Yup from 'yup';

export const collectFeeValidationSchema = Yup.object().shape({
  feeType: Yup.string().required('Fee type is required'),
  selectedTerms: Yup.array().min(1, 'Please select at least one term').of(Yup.string().required()),
  paymentMode: Yup.array()
    .min(1, 'Please select at least one payment mode')
    .of(Yup.string().required()),
  dueAmount: Yup.number()
    .typeError('Due amount must be a number')
    .required('Due amount is required')
    .min(0, 'Due amount cannot be negative'),
  receivedAmount: Yup.number()
    .typeError('Received amount must be a number')
    .required('Received amount is required')
    .min(0, 'Received amount cannot be negative'),
});
