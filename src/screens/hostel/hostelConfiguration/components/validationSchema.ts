import * as Yup from 'yup';

export const hostelValidationSchema = Yup.object({

  hostelName: Yup.string().required('Hostel name is required'),
  totalRoomCapacity: Yup.number()
    .typeError('Must be a number')
    .required('Total room capacity is required'),
  wardenDetails: Yup.string().required('Warden details are required'),
  currentOccupation: Yup.string().required('Current occupation is required'),
  hostelType: Yup.string().required('Hostel type is required'),
  location: Yup.string().required('Location is required'),
});

export const hostelRoomValidationSchema = Yup.object().shape({
  roomName: Yup.string().trim().required('Room name is required'),

  roomType: Yup.string()
    .oneOf(['Single', 'Double', 'Triple'], 'Invalid room type')
    .required('Room type is required'),

  floorNumber: Yup.number()
    .typeError('Floor number must be a number')
    .min(0, 'Floor number cannot be negative')
    .required('Floor number is required'),

  roomCapacity: Yup.number()
    .typeError('Room capacity must be a number')
    .min(0, 'Room capacity cannot be negative')
    .required('Room capacity is required'),

  beds: Yup.array()
    .of(Yup.string())
    .max(Yup.ref('roomCapacity'), 'Number of beds cannot exceed room capacity')
    .required('Beds are required'),

  roomStatus: Yup.string()
    .oneOf(['Available', 'Occupied', 'Maintenance'], 'Invalid room status')
    .required('Room status is required'),
});

