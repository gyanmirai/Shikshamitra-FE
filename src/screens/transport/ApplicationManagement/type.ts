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
  id?: string;
  applicationId?: string;
  memberType?: number;
  applicationType?: number;
  sourceId?: string;
  memberId?: string;
  selectedStudent: number | string;
  studentId?: string;
  employeeId?: string;
  avatarUrl?: string;
  name: string;
  addressLine1?: string;
  class: string;
  className?: string;
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
  statusName?: string;
  isStopExist: boolean;
  requestedStopId?: string;
  requestedStopName?: string;
  assignedStop?: string;
  assignedStopId?: string;
  assignedStopName?: string;
  assignedRoute?: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
}
