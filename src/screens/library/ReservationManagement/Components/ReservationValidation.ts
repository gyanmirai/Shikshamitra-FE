import dayjs from 'dayjs';
import * as Yup from 'yup';

export const reservationValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    role: Yup.string().required('Role is required'),

    class: Yup.string().when('role', {
      is: 'Student',
      then: (schema) => schema.required('Class is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    division: Yup.string().when('role', {
      is: 'Student',
      then: (schema) => schema.required('Division is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    // Only validate member when role ≠ Student
    member: Yup.string().required('Member is required'),
    bookCategory: Yup.string().required('Book Category is required'),
    bookTitle: Yup.string().required('Book Title is required'),
    requestedDate: Yup.mixed()
      .required('Requested Date is required')
      .test(
        'is-valid-dayjs',
        'Requested Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Requested Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Requested Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    dueDate: Yup.mixed()
      .required('Due Date is required')
      .test(
        'is-valid-dayjs',
        'Due Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'is-after-requested-date',
        'Due Date cannot be before Requested Date',
        // eslint-disable-next-line func-names
        function (value) {
          const { requestedDate } = this.parent;
          if (!value || !requestedDate) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(requestedDate));
        }
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
  });
