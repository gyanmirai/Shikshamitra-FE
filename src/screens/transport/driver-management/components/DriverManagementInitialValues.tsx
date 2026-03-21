import type { IDriverConductor } from './type';

export const getDriverConductorInitialValues = (editData?: IDriverConductor | null) => ({
  employeeId: editData?.employeeId || '',
  role: editData?.role || '',
  name: editData?.name || '',
  licenceExpiry: editData?.licenceExpiry || '',
  experience: editData?.experience || '',
  phoneNo: editData?.phoneNo || '',
  assignedRoute: editData?.assignedRoute || '',
  status: editData?.status || 'Active',
});

export const getAssignRouteInitialValues = (driverData?: IDriverConductor | null) => ({
  driverId: driverData?.employeeId || '',
  driverName: driverData?.name || '',
  currentRoute: driverData?.assignedRoute || '',
  selectedRoute: '',
});
