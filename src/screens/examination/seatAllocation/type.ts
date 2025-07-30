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
