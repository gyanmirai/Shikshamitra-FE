export interface LeaveRequestType {
  userId: string;
  employeeId: string;
  leaveType: string;
  color: string;
  halfDay: boolean;
  startDate: string;
  endDate: string;
  status: number;
  description: string;
  rejectionReason: string;
  isDeleted: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  lastModificationTime: string;
  lastModifierId: string;
  creationTime: string;
  creatorId: string;
  id: string;
}
