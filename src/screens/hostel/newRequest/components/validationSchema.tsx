import * as Yup from 'yup';

export const hostelRequestValidationSchema = Yup.object({
  hostelName: Yup.string().required('Hostel Name is required'),
  hostelType: Yup.string().required('Hostel Type is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  name: Yup.string().required('Name is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.string().required('Date of Birth is required'),
  packageName: Yup.string().required('Package Name is required'),
  totalAmount: Yup.number().required('Total Amount is required').min(0),
  scheduleDate: Yup.date().required('Schedule Date is required'),
  joinDate: Yup.date().required('Join Date is required'),
  feesFrequency: Yup.string().required('Fees Frequency is required'),
  interationCost: Yup.string().required('Interaction Cost is required'),
});
