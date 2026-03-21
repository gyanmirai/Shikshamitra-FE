export interface IDriverConductor {
  avatarUrl: string;
  id: string;
  staffId?: string;
  employeeId: string;
  role: 'Driver' | 'Conductor';
  name: string;
  licenceExpiry: string;
  experience: string;
  phoneNo: string;
  assignedRoute?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  createdBy?: string;
  createdOn?: string;
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
}
