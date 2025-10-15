import dayjs from 'dayjs';

import type { IRouteData, IRoutesData, IRoutePayload } from '../Components/type';

export const getInitialRouteData = (editData?: IRoutePayload): IRoutePayload => ({
  // General Information
  routeName: editData?.routeName || '',
  routeCode: editData?.routeCode || '',
  routeType: editData?.routeType || '',
  startPoint: editData?.startPoint || '',
  endPoint: editData?.endPoint || '',
  distance: editData?.distance || '',
  startTime: editData?.startTime ? dayjs(editData.startTime) : null,
  endTime: editData?.endTime ? dayjs(editData.endTime) : null,
  duration: editData?.duration || '',
  description: editData?.description || '',

  // Stops Assignment
  stops: editData?.stops || [],

  // Vehicle Assignments
  vehicleAssignments: editData?.vehicleAssignments || [],
});

// New function for stop status change form
export const getInitialStopStatusData = (stopData?: IRoutesData | null) => ({
  status: stopData?.status || 'Active',
  reason: stopData?.reason || '',
});

// New function for route status change form
export const getInitialRouteStatusData = (routeData?: IRouteData | null) => ({
  status: routeData?.status || 'Active',
  date: dayjs(),
  remarks: '',
});
