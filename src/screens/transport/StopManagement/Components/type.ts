import type { Dayjs } from 'dayjs';

export enum StopStatusType {
  Active,
  Inactive,
}

export const StopStatusTypeColor: Record<StopStatusType, string> = {
  [StopStatusType.Active]: 'success',
  [StopStatusType.Inactive]: 'error',
};

export const StopStatusOptions = [
  { label: 'Active', value: StopStatusType.Active },
  { label: 'Inactive', value: StopStatusType.Inactive },
];

export interface IStopData {
  id: string;
  stopName: string;
  landmark: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  pincode: number | null;
  areaLocalityRoadName: string;
  zone: string;
  amount: string;
  assignedStudents: number;
  status: StopStatusType;
  createdDate?: string;
  updatedDate?: string;
  approxKmFromSchool?: number | null;
}

export interface IStopInformation {
  stopName: string;
  landmark: string;
  buildingNo?: string;
  flatHouseNo?: string;
  areaLocalityRoadName: string;
  zone: string;
}

export interface IStopPayload {
  stopName: string;
  landmark: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  pincode: number | null;
  areaLocalityRoadName: string;
  zone: string;
  amount: string;
  status?: StopStatusType;
  description?: string | null;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  approxKmFromSchool?: number | null;
}

export interface IStopStatusChange {
  status: StopStatusType;
  date: Dayjs | null;
  reason: string;
}

// History interfaces
export interface IStopHistoryRow {
  id: string;
  stopName: string;
  landmark: string;
  zone: string;
  assignedStudents: number;
  status: StopStatusType;
  lastModified: string;
  modifiedBy?: string;
}

export interface IStudentAssignmentRow {
  id: string;
  studentName: string;
  class: string;
  section: string;
  rollNumber: string;
  assignedDate: string;
  status: 'Active' | 'Inactive';
  parentContact?: string;
}

export interface IRouteStopRow {
  id: string;
  routeName: string;
  stopSequence: number;
  estimatedTime: string;
  distance: string;
  status: 'Active' | 'Inactive';
  assignedDate?: string;
}

// Stop View Details Props
export interface StopViewDetailsProps {
  stopData: IStopData | null;
  onClose: () => void;
}

// Change Status Modal Props
export interface ChangeStopStatusProps {
  isOpen: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
  stopData: IStopData | null;
  onStatusChange: (statusData: any) => void;
}

// Stop Management Table Props
export interface StopManagementTableProps {
  stops: IStopData[];
  onEdit: (stop: IStopData) => void;
  onStatusChange: (stop: IStopData) => void;
  onView: (stop: IStopData) => void;
  loading?: boolean;
}
