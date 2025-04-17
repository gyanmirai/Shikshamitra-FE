export interface ILeavePolicy {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  leaveType: string;
  leaveDays: number;
  carryForward: boolean;
  accrualRate: number;
  color: string;
}
