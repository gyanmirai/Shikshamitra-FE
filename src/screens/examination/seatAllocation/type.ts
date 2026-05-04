export interface ISeat {
  seatNumber: number;
  isAssigned: boolean;
  studentName?: string;
  benchNumber: number;
  standardName?: string;
  rollNo?: number;
  column: number; // for display grouping
  row: number;
  studentId: string | null; // uuid
  benchId?: string; // uuid
}

export interface IRoom {
  id: string; // uuid
  roomName: string;
  roomNumber?: string;
  capacity: number;
  allocatedSeats?: number;
  availableSeats?: number;
  isAllocationCompleted?: boolean;
  // FE-only display fields for seat grid layout
  rows?: number;
  columns?: number;
  benchCapacity?: number;
}

export interface IStudentRoomAssignment {
  studentId: string; // uuid
  studentName: string;
  rollNo: number;
  standardName?: string;
  isSeatAllocate: boolean;
  bench?: string; // FE-only display
  room?: string; // FE-only display
  seatNumber?: number;
}

export interface ISeatAllocation {
  seatNumber: number;
  studentName?: string;
  standardName?: string;
  rollNo?: number;
  studentId: string | null; // uuid
  isRoomAssign: boolean;
  benchId?: string; // uuid
}

export interface IExamAllocation {
  examId: string; // uuid
  examName: string;
  examTypeName: string;
  standardName: string;
  divisions: string[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  status: number; // 0=pending, 1=partial, 2=allocated
}

export interface IDroppedStudent {
  studentId: string; // uuid
  seatNumber: number;
  benchId: string | null; // uuid, nullable
  isRoomAssign: boolean;
}

export interface IDroppedData {
  roomId: string;
  students: IDroppedStudent[];
}
