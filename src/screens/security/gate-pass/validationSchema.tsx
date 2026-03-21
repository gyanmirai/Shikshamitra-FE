import * as Yup from 'yup';

export const earlyPassRequestValidationSchema = Yup.object().shape({
  childName: Yup.string().required('Child name is required'),
  pickupTime: Yup.date().nullable().required('Pickup time is required'),
  pickupDate: Yup.date().nullable().required('Pickup date is required'),
  reasonForPickup: Yup.string().required('Reason for pickup is required'),
});
