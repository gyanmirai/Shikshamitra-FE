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

export interface IRoom {
  id: number;
  roomName: string;
  capacity: number;
  building: string;
  floor: string;
  roomType: string;
  totalBenches: number;
  benchCapacity: number;
  rows: number;
  columns: number;
  features: string[];
}

export interface IStudentRoomAssignment {
  id: number;
  name: string;
  rollNo: string;
  bench?: string;
  room?: string;
  isRoomAssign: boolean;
}

export interface ISeatAllocation {
  seatNumber: number;
  studentName: string;
  class: string;
  rollNo: number;
  studentId: number;
  isRoomAssign: boolean;
}

export interface IExamAllocation {
  examName: string;
  examType: string;
  className: number;
  divisions: string[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  status: string;
}
