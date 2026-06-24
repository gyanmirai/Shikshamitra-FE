export interface IDriverConductor {
  avatarUrl: string;
  id: string;
  staffId?: string;
  employeeId: string;
  employeeGuid?: string;
  employeeCode?: string;
  role: 'Driver' | 'Conductor';
  roleId?: number;
  name: string;
  licenceNo?: string;
  licenceExpiry: string;
  licenceExpiryDate?: string;
  experience: string;
  experienceYears?: number;
  phoneNo: string;
  assignedRoute?: string;
  assignedRouteId?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  statusId?: number;
  createdBy?: string;
  createdOn?: string;
  remarks?: string;
}

export interface IDriverManagementTableProps {
  onAddDriverConductor: any;
  editData: IDriverConductor | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IDriverConductor | null) => void;
}

export interface IDriverConductorFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IDriverConductor | null;
}

export interface IAssignRouteFormProps {
  onClose: (e: any, isSubmit?: boolean) => void;
  editData?: IDriverConductor | null;
  driverData: IDriverConductor | null;
}

export interface IAssignRouteValues {
  driverId: string;
  driverName: string;
  currentRoute: string;
  selectedRoute: string;
  selectedVehicle: string;
  selectedConductor: string;
}
