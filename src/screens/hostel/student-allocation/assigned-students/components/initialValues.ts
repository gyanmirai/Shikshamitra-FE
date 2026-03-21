import type { IStudentRoomAssignFormValues } from '../type';

export const getStudentRoomAssignInitialValues = (
  selectedStudent?: IStudentRoomAssignFormValues | null
) => ({
  studentName: selectedStudent?.studentName || '',
  roomType: selectedStudent?.roomType || '',
  roomName: selectedStudent?.roomName || '',
  bedNumber: selectedStudent?.bedNumber || '',
});
