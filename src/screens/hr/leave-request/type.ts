export interface LeaveRequestType {
  userId: string;
  employeeId: string;
  paidType: string;
  color: string;
  halfDay: boolean;
  startDate: string;
  endDate: string;
  status: string | number;
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
