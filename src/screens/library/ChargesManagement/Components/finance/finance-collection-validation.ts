import dayjs from 'dayjs';
import * as Yup from 'yup';

const cents = (value: string): bigint | null => {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  return match ? BigInt(match[1]) * BigInt(100) + BigInt((match[2] || '').padEnd(2, '0')) : null;
};

export function createFinanceCollectionSchema(collectible: number | undefined) {
  return Yup.object({
    amount: Yup.string()
      .required('Payment amount is required')
      .test(
        'money',
        'Enter a positive amount with at most two decimal places within the collectible balance.',
        (value) => {
          const amount = cents(value || '');
          const limit = cents(String(collectible ?? '0'));
          return (
            amount !== null &&
            limit !== null &&
            amount > BigInt(0) &&
            amount <= limit &&
            amount <= BigInt(999999900)
          );
        }
      ),
    paymentMethod: Yup.string().required('Payment method is required'),
    schoolReceiptDate: Yup.string()
      .required('School receipt date is required')
      .test('date', 'Enter a valid school receipt date.', (value) =>
        Boolean(
          value && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value, 'YYYY-MM-DD', true).isValid()
        )
      ),
    bankAccountId: Yup.string().when('paymentMethod', {
      is: (method: string) => method !== '' && method !== '0',
      then: (schema) => schema.required('Receiving school bank is required'),
    }),
    notes: Yup.string().max(1000, 'Notes must be at most 1000 characters'),
  });
}
