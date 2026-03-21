import dayjs from 'dayjs';
import * as Yup from 'yup';

export const memberValidationSchema = Yup.object().shape({
  role: Yup.string().trim().required('Role is required'),
  class: Yup.string()
    .trim()
    .when('role', {
      is: (role: string) => role === 'Student',
      then: (schema) => schema.required('Class is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  division: Yup.string()
    .trim()
    .when('role', {
      is: (role: string) => role === 'Student',
      then: (schema) => schema.required('Division is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  student: Yup.string().trim().required('Member is required'),
});

export const changeStatusValidationSchema = Yup.object().shape({
  status: Yup.string()
    .trim()
    .required('Status is required')
    .oneOf(['Active', 'Inactive', 'Suspended'], 'Please select a valid status'),

  remarks: Yup.string()
    .trim()
    .max(500, 'Remarks cannot exceed 500 characters')
    .when('status', {
      is: (status: string) => status === 'Inactive' || status === 'Suspended',
      then: (schema) =>
        schema.required('Remarks are required when changing status to Inactive or Suspended'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export const makeReservationValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    bookCategory: Yup.string()
      .trim()
      .required('Book category is required')
      .oneOf(
        ['Text Book', 'Reference Book', 'Novel', 'Magazine', 'Journal'],
        'Please select a valid book category'
      ),

    bookTitle: Yup.string()
      .trim()
      .required('Book title is required')
      .oneOf(
        [
          'Introduction to Physics',
          'Advanced Mathematics',
          'Chemistry Fundamentals',
          'Biology Basics',
          'History of India',
        ],
        'Please select a valid book title'
      ),

    requestedDate: Yup.mixed()
      .required('Requested date is required')
      .test(
        'is-valid-dayjs',
        'Requested date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) => `Requested date cannot be in the past`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Requested date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    dueDate: Yup.mixed()
      .nullable()
      .required('Due date is required')
      .test(
        'is-valid-dayjs',
        'Due date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'is-after-requested-date',
        'Due date must be after the requested date',
        // eslint-disable-next-line func-names
        function (value) {
          const { requestedDate } = this.parent;
          if (!value || !requestedDate) return true;
          return dayjs(value as any).isAfter(dayjs(requestedDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `Due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
  });
