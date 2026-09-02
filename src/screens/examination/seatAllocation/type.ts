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
  isExternalExamOccupied?: boolean;
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
  isExternalExamOccupied?: boolean;
}

export interface IExamAllocation {
  examId: string; // uuid
  examName: string;
  examTypeName: string;
  standardName: string;
  divisions: string[];
  divisionProgress?: IExamAllocationDivisionProgress[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  roomsUsed?: number;
  seatingPlanCount?: number;
  subjectCount?: number;
  plannedSubjectCount?: number;
  subjectNames?: string[];
  sessions?: IExamAllocationSession[];
  status: number;
}

export interface IExamAllocationSession {
  sessionKey: string;
  seatingPlanId?: string | null;
  seatingPlanName?: string | null;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  subjectNames: string[];
  divisions: string[];
  divisionProgress: IExamAllocationDivisionProgress[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  roomsUsed: number;
  usableCapacity: number;
  emptySeats: number;
  utilization: number;
  status: number;
  hasCompleteSchedule: boolean;
  canPrepare: boolean;
  requiresMigration: boolean;
  blockingIssueCount: number;
}

export interface IExamAllocationDivisionProgress {
  divisionId: string;
  divisionName: string;
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  progress: number;
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
