import type { HostelGateVerificationStatusType } from 'src/enums/gateapproval-hostel';

export interface IHostelGateVerification {
  id: number;
  roomNumber: number;
  studentName: string;
  hostelName: string;
  outTime: string; // ISO date string
  returnETA: string; // ISO date string
  status: HostelGateVerificationStatusType;
}
