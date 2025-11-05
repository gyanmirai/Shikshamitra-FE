import dayjs from 'dayjs';
import { RouteStatus } from 'src/enums/route-status';

import type { IRouteData, IRoutesData, IRoutePayload } from '../Components/type';

export const getInitialRouteData = (editData?: IRoutePayload): IRoutePayload => ({
  // General Information
  routeName: editData?.routeName || '',
  routeCode: editData?.routeCode || '',
  routeType: editData?.routeType || '', // "Pickup", "Dropoff", or "Both"
  distance: editData?.distance || '',
  duration: editData?.duration || '',
  description: editData?.description || '',
  startPoint: editData?.startPoint ?? '',
  endPoint: editData?.endPoint ?? '',
  // Pickup Schedule
  pickupSchedule: {
    startTime: editData?.dropoffSchedule?.startTime
      ? dayjs(editData?.dropoffSchedule?.startTime)
      : null,
    endTime: editData?.dropoffSchedule?.endTime ? dayjs(editData?.dropoffSchedule?.endTime) : null,
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
  vehicleAssignment: editData?.vehicleAssignment || {
    vehicleId: '',
    vehicleNo: '',
    capacity: 0,
    driverId: '',
    driverName: '',
    conductorId: '',
    conductorName: '',
  },
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
