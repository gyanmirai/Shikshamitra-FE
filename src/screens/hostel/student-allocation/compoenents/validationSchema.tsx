import * as Yup from 'yup';

export const hostelRoomValidationSchema = Yup.object({
  roomName: Yup.string().required('Room name is required'),
  roomType: Yup.string().required('Room type is required'),
  floorNumber: Yup.number().required('Floor number is required').min(0),
  roomCapacity: Yup.number().required('Room capacity is required').min(1),
  roomStatus: Yup.string().required('Room status is required'),
  bed: Yup.string().required('bed is required'),
});
