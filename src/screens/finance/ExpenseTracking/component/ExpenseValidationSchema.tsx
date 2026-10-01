import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getExpenseFormSchema = (currentYear: any) =>
  Yup.object().shape({
    categoryId: Yup.string().required('Expense Category is required'),
    categoryTags: Yup.array().of(Yup.string()),
    name: Yup.string()
      .min(1, 'Expense name must be at least 1 character')
      .max(255, 'Expense name cannot exceed 255 characters')
      .required('Expense Name is required'),
    amount: Yup.number()
      .required('Amount is required')
      .typeError('Amount must be a number')
      .min(0.01, 'Amount must be at least 0.01')
      .max(999999999999.99, 'Amount is too large')
      .test('paise', 'Use no more than two decimal places', (value) =>
        value == null || /^\d+(\.\d{1,2})?$/.test(String(value))
      ),
    paymentMethod: Yup.number()
      .required('Payment Method is required')
      .typeError('Payment Method is required'),
    paymentDate: Yup.mixed()
      .required('Payment date is required')
      .test(
        'is-valid-dayjs',
        'Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) => `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) => `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    notes: Yup.string().nullable().max(1000, 'Notes cannot exceed 1000 characters'),
  });
