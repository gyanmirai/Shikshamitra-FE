import type { TransportStatus } from 'src/enums/trasnport-status';

export interface IStudent {
  name: string;
  className: string;
  rollNo: string;
  role: string;
  grNo: string;
  contactNo: string;
  photoUrl?: string;
}

export interface ITransportApplicationPayload {
  selectedStudent: number;
  studentId: string;
  avatarUrl?: string;
  name: string;
  addressLine1?: string;
  class: string;
  division: string;
  feeAmount?: number;
  rollNo: string;
  role: string;
  grNo: string;
  contactNo: string;
  photoUrl?: string;
  searchStop: string;
  pickupType: string;
  landmark: string;
  areaLocality: string;
  description?: string;
  status: TransportStatus;
  isStopExist: boolean;
  assignedStop?: number;
  assignedRoute?: number;
}
