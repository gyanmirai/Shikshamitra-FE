import * as Yup from 'yup';

export const validationSchema = Yup.object({
  hostelName: Yup.string().required('Hostel name is required'),
  totalRoomCapacity: Yup.number()
    .typeError('Must be a number')
    .required('Total room capacity is required'),
  wardenDetails: Yup.string().required('Warden details are required'),
  currentOccupation: Yup.string().required('Current occupation is required'),
  hostelType: Yup.string().required('Hostel type is required'),
  location: Yup.string().required('Location is required'),
});
