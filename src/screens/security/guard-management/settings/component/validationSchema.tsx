import dayjs from 'dayjs';
import * as Yup from 'yup';

export const guardShiftValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Shift name is required'),

  startTime: Yup.date().nullable().required('Start time is required'),

  endTime: Yup.date()
    .nullable()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { startTime } = this.parent;
      return value && startTime && dayjs(value).isAfter(dayjs(startTime));
    }),

  description: Yup.string()
    .optional()
    .nullable()
    .max(300, 'Description can be up to 300 characters'),
});
