import type { Dayjs } from 'dayjs';

export type LeaveDecisionContext = {
  studentName?: string;
  leaveTypeName?: string;
  leaveDate?: string;
  endDate?: string;
};

export interface IFormValues {
  leaveType: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isHalfDay: boolean;
  rejectionReason: string;
  status: string | null;
  docs: string;
}

export interface ILeaveAbsent {
  type: string;
  color: string;
  lastModificationTime: null;
  lastModifierId: null;
  creationTime: string;
  creatorId: string;
  id: string;
  leaveTypeName: string;
}
