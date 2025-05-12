import * as Yup from 'yup';

export const hostelRoomValidationSchema = Yup.object().shape({
  roomName: Yup.string().required('Room name is required'),
  roomType: Yup.string().required('Room type is required'),
  floorNumber: Yup.number().required('Floor number is required'),
  roomCapacity: Yup.number().required('Room capacity is required'),
  facility: Yup.array().of(Yup.string()),
  status: Yup.string().required('Room status is required'),
});
