export interface IViewVehicleDetailsDialogProps {
  vehicle: IVehicle;
}

export interface IVehicleFormDialogProps {
  vehicle: any;
  dialogValue: boolean;
  onClose: () => void;
  isEdit: boolean;
}

interface IInsurance {
  policyNumber: string;
  provider: string;
  expiryDate: string;
  coverageDetails: string;
}

interface IMaintenance {
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  notes: string;
}

interface IDriver {
  id: string;
  name: string;
}

interface IRoute {
  id: string;
  name: string;
}

interface IDailyInspection {
  date: string;
  inspector: string;
  remarks: string;
  issuesFound: string[];
  actionTaken: string;
}

interface IStudent {
  name: string;
  id: string;
}

export interface IVehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  registrationNumber: string;
  registrationDate: string;
  registrationExpiryDate: string;
  insurance: IInsurance;
  maintenance: IMaintenance;
  fuelType: string;
  currentStatus: string;
  trackingEnabled: boolean;
  trackerId: string | null;
  assignedDriver: IDriver;
  assignedRoute: IRoute;
  dailyInspection: IDailyInspection[];
  studentList: IStudent[];
}
