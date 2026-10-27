import dayjs from 'dayjs';
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
  cashCollectionId: Yup.string().when(['paymentMethod', '$direction'], {
    is: (method: number, direction: string) =>
      method === PaymentMethod.CASH && direction === 'expense',
    then: (schema) => schema.required('Select a pending cash source.'),
  }),
  bankAccountId: Yup.string().when('paymentMethod', {
    is: (method: number) => method !== PaymentMethod.CASH,
    then: (schema) => schema.required('Select a school bank account.'),
  }),
  paymentDate: Yup.string().required('Select a payment date.'),
  cashPaymentDateTime: Yup.string().when(['paymentMethod', '$direction'], {
    is: (method: number, direction: string) => method === PaymentMethod.CASH && Boolean(direction),
    then: (schema) =>
      schema
        .required('Select the actual payment time.')
        .test('cash-time', 'Select a valid payment time no later than now.', (value) =>
          Boolean(value && dayjs(value).isValid() && !dayjs(value).isAfter(dayjs()))
        ),
  }),
  paymentReference: Yup.string().max(100).when(['paymentMethod', '$direction'], {
    is: (method: number, direction: string) =>
      method === PaymentMethod.CASH && direction === 'expense',
    then: (schema) => schema.trim().required('Enter a payment reference for this cash expense.'),
  }),
  notes: Yup.string().max(2000),
});
