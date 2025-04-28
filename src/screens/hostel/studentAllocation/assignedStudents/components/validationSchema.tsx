import * as Yup from 'yup';

export const studentRoomAssignValidationSchema = Yup.object({
  studentName: Yup.string().required('Student name is required'),
  roomType: Yup.string().required('Room type is required'),
  roomName: Yup.string().required('Room name is required'),
  bedNumber: Yup.string().required('Bed number is required'),
});
