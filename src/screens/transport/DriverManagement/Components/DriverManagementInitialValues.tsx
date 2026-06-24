import type { IDriverConductor } from './type';

export const getDriverConductorInitialValues = (editData?: IDriverConductor | null) => ({
  employeeId: editData?.employeeGuid || '',
  role: editData?.roleId ?? (editData?.role === 'Conductor' ? 1 : 0),
  name: editData?.name || '',
  licenceNo: editData?.licenceNo || '',
  licenceExpiry: editData?.licenceExpiry || '',
  experienceYears: editData?.experienceYears ?? '',
  phoneNo: editData?.phoneNo || '',
  assignedRoute: editData?.assignedRoute || '',
  status: editData?.status || 'Active',
  remarks: editData?.remarks || '',
});

export const getAssignRouteInitialValues = (driverData?: IDriverConductor | null) => ({
  driverId: driverData?.employeeId || '',
  driverName: driverData?.name || '',
  currentRoute: driverData?.assignedRoute || '',
  selectedRoute: '',
  selectedVehicle: '',
  selectedConductor: '',
});
