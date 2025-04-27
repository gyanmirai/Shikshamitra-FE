import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelRoomStudent {
  id: string; // Unique identifier for the record
  studentName: string; // Student's full name
  class: string; // Class name or number (example: "10th Grade" or "10")
  division: string; // Division (example: "A", "B", etc.)
  bedNumber: string; // Assigned bed number in the room
}

export interface IStudentRoomAssignProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  selectedStudent: IStudentRoomAssignFormValues | null;
}

export interface IStudentRoomAssignFormValues {
  studentName: string;
  roomType: string;
  roomName: string;
  bedNumber: string;
}
