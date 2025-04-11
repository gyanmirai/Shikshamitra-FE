import * as Yup from 'yup';

export const addIncomeValidationSchema = Yup.object().shape({
  incomeSource: Yup.string().required('Income source is required'),
  incomeAmount: Yup.string()
    .required('Income amount is required')
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),
  paymentMethod: Yup.string().required('Payment method is required'),
  date: Yup.date().required('Date is required').typeError('Invalid date'),
  paymentStatus: Yup.string().required('Payment status is required'),
  incomeName: Yup.string().required('Income name is required'),
  notes: Yup.string().optional(), // Optional field
});
