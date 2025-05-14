import * as Yup from 'yup';

export const packageValidationSchema = Yup.object().shape({
  name: Yup.string().required('Package name is required'),
  description: Yup.string().required('Description is required'),
  amount: Yup.number().min(0).required('Amount is required'),
  depositAmount: Yup.number().min(0).required('Deposit amount is required'),
  facilityGroup: Yup.string().required('Facilities are required'),
  otherFacilities: Yup.string(),
  scheduleDate: Yup.string(),
  status: Yup.string(),
});
