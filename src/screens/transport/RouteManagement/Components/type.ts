import type { Dayjs } from 'dayjs';
import type { RouteStatus } from 'src/enums/route-status';
import type { RouteType } from 'src/enums/route-type-options';

export interface ISchedule {
  startTime: Dayjs | string | null;
  endTime: Dayjs | string | null;
}

export interface IRoutePayload {
  id?: string;
  routeName: string;
  routeCode: string;
  routeType: RouteType;
  distance: string;
  duration: string;
  description: string;
  startPoint?: string;
  endPoint?: string;
  pickupSchedule?: ISchedule;
  dropoffSchedule?: ISchedule;
  stops: any[];
  stopData?: any[];
  vehicleAssignment: any;
}

export interface IStopPayload {
  id: string;
  stopId?: string;
  stopName: string;
  expectedArrivalTime: Dayjs | null;
  expectedDepartureTime: Dayjs | null;
  arrivalTime: Dayjs | null;
  departureTime: Dayjs | null;
  distanceFromPrevious: string;
  order: number;
}

export interface IVehicleAssignmentPayload {
  vehicleId: string;
  vehicleNo: string;
  capacity: number;
  driverId: string;
  driverName: string;
  conductorId: string;
  conductorName: string;
}

// Additional types for status management
export interface IRoutesData {
  id: string;
  routeName: string;
  status: RouteStatus;
  reason?: string;
  // Add other stop properties as needed
}

export interface ChangeStopStatusProps {
  isOpen: boolean;
  onClose: (e?: any, isSubmit?: boolean) => void;
  routeData: IRoutesData | null;
  onStatusChange: (values: any) => void;
}

// Route status types
export interface IRouteData {
  id: string;
  routeName: string;
  routeCode: string;
  status: RouteStatusType;
  startPoint: string;
  endPoint: string;
  distance: string;
  stops: string;
  capacity: number;
  students: number;
  stopData?: IRoutesData[];
  // Add other route properties as needed
}

export interface ChangeRouteStatusProps {
  isOpen: boolean;
  onClose: (e?: any, isSubmit?: boolean) => void;
  routeData: IRouteData | null;
  onStatusChange?: (routeId: string, newStatus: string) => void;
}

// Status options and types
export type StopStatusType = 'Active' | 'Inactive' | 'Under Maintenance';
export type RouteStatusType = 'Active' | 'Inactive';

export interface IStopStatusChange {
  status: StopStatusType;
  date: Dayjs | null;
  reason: string;
}

export const RouteStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

// Status color mapping
export const StopStatusColors: Record<StopStatusType, string> = {
  Active: 'success',
  Inactive: 'error',
  'Under Maintenance': 'warning',
};

export const RouteStatusColors: Record<RouteStatusType, string> = {
  Active: 'success',
  Inactive: 'error',
};
