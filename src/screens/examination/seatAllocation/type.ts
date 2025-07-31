export interface ISeat {
  seatNumber: number;
  isAssigned: boolean;
  studentName?: string;
  benchNumber: number;
  class?: string;
  rollNo?: number;
  column: number; // for display grouping
  row: number;
  studentId: number | null;
}

export interface IStudentRoomAssignment {
  id: number;
  name: string;
  rollNo: string;
  bench?: string;
  room?: string;
  isRoomAssign: boolean;
}
