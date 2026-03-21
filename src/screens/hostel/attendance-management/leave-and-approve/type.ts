import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IAddLeaveRequestProps {
  open: UseBooleanReturn;
  editData?: any;
  onClose?: (e: any, isSubmit: boolean) => void;
}

export interface ILeaveFormValues {
  leaveType: string;
  isHalfDay: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  description: string;
  status?: number;
  rejectionReason: string;
  docs: string;
}

export interface IStudentAttendanceLeave {
  studentName: string;
  roomNo: string;
  hostelName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  description: string;
  rejectionReason?: string;
  statusValue: number;
}
