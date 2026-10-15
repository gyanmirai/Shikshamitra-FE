import * as Yup from 'yup';
import { PaymentMethod } from 'src/enums/finance-payment-method';

export const manualEntrySchema = Yup.object({
  name: Yup.string().trim().required('Enter a transaction name.').max(200),
  counterparty: Yup.string().trim().required('Enter the payer or payee.').max(200),
  categoryId: Yup.string().required('Select a category.'),
  amount: Yup.string()
    .required('Enter an amount.')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter an amount with at most two decimals.')
    .test(
      'range',
      'Amount must be between 0.01 and 999999999999.99.',
      (value) => Number(value) >= 0.01 && Number(value) <= 999999999999.99
    ),
  paymentMethod: Yup.number().required('Select a payment method.').min(0).max(6),
  bankAccountId: Yup.string().when('paymentMethod', {
    is: (method: number) => method !== PaymentMethod.CASH,
    then: (schema) => schema.required('Select a school bank account.'),
  }),
  paymentDate: Yup.string().required('Select a payment date.'),
  paymentReference: Yup.string().max(100),
  notes: Yup.string().max(2000),
});
