import dayjs from 'dayjs';
import * as Yup from 'yup';

export const assignLibraryChargeValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    role: Yup.string().required('Role is required'),

    // Student-specific validations
    class: Yup.string().when('role', (role: unknown, schema) =>
      (role as string) === 'Student' ? schema.required('Class is required') : schema.nullable()
    ),

    division: Yup.string().when('role', (role: unknown, schema) =>
      (role as string) === 'Student' ? schema.required('Division is required') : schema.nullable()
    ),

    // Member required only when role ≠ Student
    member: Yup.string().when('role', (role: unknown, schema) =>
      (role as string) !== 'Student' ? schema.required('Member is required') : schema.nullable()
    ),

    // Book details
    bookTitle: Yup.string().required('Book Title is required'),

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
