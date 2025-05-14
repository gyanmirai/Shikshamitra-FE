export interface IStudentHostelManualAttendance {
  id: string;
  roomNo: string;
  studentName: string;
  hostelName: string;
  isPresent: boolean; // true for Present, false for Absent
  remarks?: string;
  onLeave?: boolean; // true for Leave, false for Absent
}
