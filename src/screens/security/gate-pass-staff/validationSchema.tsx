import * as Yup from 'yup';

export const staffPassRequestValidationSchema = Yup.object().shape({
  leaveTime: Yup.date().nullable().required('Pickup time is required'),
  leaveDate: Yup.date().nullable().required('Pickup date is required'),
  reasonForLeave: Yup.string().required('Reason for pickup is required'),
});
