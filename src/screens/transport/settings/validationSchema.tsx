import * as Yup from 'yup';

export const settingsValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  emergencyContact: Yup.string()
    .matches(/^\d{10}$/, 'Must be a valid 10-digit number')
    .required('Emergency contact is required'),
  bloodGroup: Yup.string().required('Blood group is required'),
  address: Yup.string().required('Address is required'),
  aadharCard: Yup.string().matches(/^\d{4}-\d{4}-\d{4}$/, 'Format: XXXX-XXXX-XXXX'),
  licenseNumber: Yup.string().required('License number is required'),
  route: Yup.string(),
  vehicle: Yup.string(),
});
