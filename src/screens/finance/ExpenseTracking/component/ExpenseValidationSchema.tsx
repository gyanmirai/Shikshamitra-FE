import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getExpenseFormSchema = (currentYear: any) =>
  Yup.object().shape({
    expenseCategory: Yup.string().required('Expense category is required'),
    budget: Yup.string().required('Budget is required'),
    expenseName: Yup.string().required('Expense name is required'),
    amount: Yup.number()
      .required('Amount is required')
      .typeError('Amount must be a number')
      .positive('Amount must be greater than zero'),
    paymentMethod: Yup.string().required('Payment method is required'),
    date: Yup.mixed()
      .required('Date is required')
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
      )
      .test(
        'no-future-date',
        'Date cannot be in the future',
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(), 'day')
      ),
    notes: Yup.string().max(500, 'Notes cannot exceed 500 characters'),
  });
