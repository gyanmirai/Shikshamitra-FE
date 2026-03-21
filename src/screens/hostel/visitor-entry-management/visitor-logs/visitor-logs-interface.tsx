import type { Dayjs } from 'dayjs';

export interface IVisitorLog {
  id: string;
  visitorName: string;
  idProof: string;
  proofNumber: string;
  contactNo: string;
  visitingWhome: string;
  entryTime: Dayjs | null;
  exitTime: Dayjs | null;
  reasonForVisit: string;
  status: string;
}
