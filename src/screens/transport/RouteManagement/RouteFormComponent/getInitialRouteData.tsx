import dayjs from 'dayjs';
import { RouteStatus } from 'src/enums/route-status';
import { RouteType } from 'src/enums/route-type-options';

import type { IRouteData, IRoutesData, IRoutePayload } from '../Components/type';

const getInitialVehicleAssignment = (editData?: IRoutePayload) => {
  const assignment = editData?.vehicleAssignment;
  if (!assignment) {
    return {
      vehicleId: '',
      vehicleNo: '',
      capacity: 0,
      driverId: '',
      driverName: '',
      conductorId: '',
      conductorName: '',
    };
  }

  return {
    vehicleId: assignment.vehicleId || '',
    vehicleNo: assignment.vehicleNo || assignment.vehicleRegistrationNo || '',
    capacity: assignment.capacity || 0,
    driverId: assignment.driverId || assignment.driverStaffId || '',
    driverName: assignment.driverName || '',
    conductorId: assignment.conductorId || assignment.conductorStaffId || '',
    conductorName: assignment.conductorName || '',
  };
};

export const getInitialRouteData = (editData?: IRoutePayload): IRoutePayload => ({
  // General Information
  routeName: editData?.routeName || '',
  routeCode: editData?.routeCode || '',
  routeType: editData?.routeType ?? RouteType.pickup,
  distance: editData?.distance || '',
  duration: editData?.duration || '',
  description: editData?.description || '',
  startPoint: editData?.startPoint ?? '',
  endPoint: editData?.endPoint ?? '',
  // Pickup Schedule
  pickupSchedule: {
    startTime: editData?.pickupSchedule?.startTime
      ? dayjs(editData?.pickupSchedule?.startTime)
      : null,
    endTime: editData?.pickupSchedule?.endTime ? dayjs(editData?.pickupSchedule?.endTime) : null,
  },

  // Dropoff Schedule
  dropoffSchedule: {
    startTime: editData?.dropoffSchedule?.startTime
      ? dayjs(editData?.dropoffSchedule?.startTime)
      : null,
    endTime: editData?.dropoffSchedule?.endTime ? dayjs(editData?.dropoffSchedule?.endTime) : null,
  },

  // Stops Assignment
  stops: editData?.stopData || [],

  // Vehicle Assignments
  vehicleAssignment: getInitialVehicleAssignment(editData),
});

// New function for stop status change form
export const getInitialStopStatusData = (stopData?: IRoutesData | null) => ({
  status: stopData?.status || RouteStatus.Active,
  reason: stopData?.reason || '',
});

// New function for route status change form
export const getInitialRouteStatusData = (routeData?: IRouteData | null) => ({
  status: routeData?.status || 'Active',
  date: dayjs(),
  remarks: '',
});
