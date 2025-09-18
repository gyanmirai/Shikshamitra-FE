import dayjs from 'dayjs';
import * as Yup from 'yup';

export const memberValidationSchema = Yup.object().shape({
  role: Yup.string()
    .trim()
    .required('Role is required')
    .oneOf(['Student', 'Teacher', 'Staff', 'Admin'], 'Please select a valid role'),

  class: Yup.string()
    .trim()
    .required('Class is required')
    .oneOf(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      'Please select a valid class'
    ),

  division: Yup.string()
    .trim()
    .required('Division is required')
    .oneOf(['A', 'B', 'C', 'D'], 'Please select a valid division'),

  student: Yup.string()
    .trim()
    .required('Student is required')
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name cannot exceed 100 characters'),
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
