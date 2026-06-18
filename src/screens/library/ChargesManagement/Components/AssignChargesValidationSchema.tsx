import dayjs from 'dayjs';
import * as Yup from 'yup';

export const assignLibraryChargeValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    memberId: Yup.string().required('Member ID is required'),

    role: Yup.string().nullable(),

    // Student-specific validations
    class: Yup.string().nullable(),

    division: Yup.string().nullable(),

    // Member required only when role ≠ Student
    member: Yup.string().nullable(),

    // Book details
    bookNumber: Yup.string().required('Book Number is required'),
    bookTitle: Yup.string().nullable(),

    // Charge details
    chargeCategory: Yup.string().required('Charge Category is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive('Amount must be positive')
      .required('Amount is required'),
    dueDate: Yup.mixed()
      .required('Due Date is required')
      .test(
        'is-valid-dayjs',
        'Due Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Due Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Due Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    reason: Yup.string().required('Reason is required'),
  });
