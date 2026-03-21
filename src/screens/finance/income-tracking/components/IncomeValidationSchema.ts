import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getIncomeFormSchema = (currentYear: any) =>
  Yup.object().shape({
    categoryId: Yup.string().required('Income category is required'),
    name: Yup.string()
      .min(1, 'Income name must be at least 1 character')
      .max(255, 'Income name cannot exceed 255 characters')
      .required('Income name is required'),
    categoryTags: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one income category tag is required')
      .required('Income category tags are required'),
    amount: Yup.number()
      .required('Amount is required')
      .typeError('Amount must be a number')
      .min(0.01, 'Amount must be at least 0.01'),
    paymentMethod: Yup.number()
      .required('Payment method is required')
      .typeError('Payment method is required'),
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
