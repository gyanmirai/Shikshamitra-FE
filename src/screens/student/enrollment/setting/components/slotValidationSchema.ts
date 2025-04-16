// utils/formik/slotValidationSchema.js
import dayjs from 'dayjs';
import * as Yup from 'yup';

export const slotValidationSchema = Yup.object().shape({
  slotName: Yup.string().required('Slot Name is required'),
  startTime: Yup.date()
    .test('startTime', 'Start time must be before end time', (value, context) => {
      if (context.parent.endTime && dayjs(context.parent.endTime).isBefore(dayjs(value))) {
        return false;
      }
      return true;
    })
    .required('Start Time is required'),
  endTime: Yup.date()
    .test('endtime', 'End time must be after start time', (value, context) => {
      if (dayjs(context.parent.startTime).isAfter(dayjs(value))) {
        return false;
      }
      return true;
    })
    .required('End Time is required'),
  studentLimit: Yup.number().min(1, 'Student Limit must be greater than 0'),
  roomNo: Yup.string().required('Room No is required'),
});
