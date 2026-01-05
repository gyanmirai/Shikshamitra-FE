import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

export enum VehicleStatusType {
  Active,
  Inactive,
  Maintenance,
}
export const VehicleStatusOptions = [
  {
    label: VehicleStatusType[VehicleStatusType.Active],
    value: VehicleStatusType[VehicleStatusType.Active],
  },
  {
    label: VehicleStatusType[VehicleStatusType.Inactive],
    value: VehicleStatusType[VehicleStatusType.Inactive],
  },
  {
    label: VehicleStatusType[VehicleStatusType.Maintenance],
    value: VehicleStatusType[VehicleStatusType.Maintenance],
  },
];

export const VehicleStatusTypeColors: Record<VehicleStatusType, LabelColor> = {
  [VehicleStatusType.Active]: 'success',
  [VehicleStatusType.Inactive]: 'error',
  [VehicleStatusType.Maintenance]: 'warning',
};

export interface IVehicleData {
  id: string;
  registrationNo: string;
  vehicleType: string;
  model: string;
  seatingCapacity: number;
  yearOfManufacture: string;
  vehicleColor: string;
  status: VehicleStatusType;
  route?: string;
  driver?: string;
  insuranceExpiry?: string;
}

export interface IVehicleMaintenance {
  serviceDate: Dayjs | null;
  serviceNotes: string;
  serviceCost: string;
  serviceProvider: string;
  nextServiceDate: Dayjs | null;
  documents: File[]; // or any[] if you support other formats
}

export interface IVehiclePayload {
  isNonAc: boolean;
  id?: string; // For edit mode
  registrationNo: string;
  vehicleName?: string; // Vehicle name field
  vehicleNo: string;
  vehicleType: string;
  vehicleCompany: string;
  model: string;
  yearOfManufacture: string;
  seatingCapacity: number;
  vehicleColor: string;
  schoolAssignedNo?: string | null;
  owner: string;
  fuelType: string;
  isAc?: boolean;
  description?: string | null;

  // Documents step - array format for API
  documents?: Array<{
    documentTypeId: string;
    file: File | string; // File object or base64 string
    fileName: string;
  }>;

  // Maintenance step - organized into objects matching API structure
  insurance?: {
    insuranceCompany: string;
    policyNo: string;
    issueDate: Dayjs | string | null;
    expiryDate: Dayjs | string | null;
    coverageAmount: number | null;
  };

  puc?: {
    certificateNo: string;
    issueDate: Dayjs | string | null;
    expiryDate: Dayjs | string | null;
  };

  roadTax?: {
    receiptNo: string;
    issueDate: Dayjs | string | null;
  };

  // Legacy fields (for backward compatibility - can be removed if not used)
  insuranceCompany?: string;
  policyNo?: string;
  insuranceIssueDate?: Dayjs | null;
  insuranceExpiryDate?: Dayjs | null;
  coverageAmount?: number | null;
  pucCertificateNo?: string;
  pucIssueDate?: Dayjs | null;
  pucExpiryDate?: Dayjs | null;
  fitnessCertificateNo?: string;
  fitnessIssueDate?: Dayjs | null;
  fitnessExpiryDate?: Dayjs | null;
  roadTaxReceiptNo?: string;
  roadTaxIssueDate?: Dayjs | null;
}

// History interfaces
export interface IMaintenanceHistoryRow {
  id: string;
  date: string;
  serviceType: string;
  cost: number;
  nextDue: string;
  serviceProvider?: string;
  description?: string;
}

export interface IRouteHistoryRow {
  id: string;
  routeName: string;
  locationPoint: string;
  driver: string;
  stops: number;
  status: 'Current' | 'Completed';
  startDate?: string;
  endDate?: string;
}

export interface IDriverHistoryRow {
  id: string;
  driverName: string;
  licenseNo: string;
  experience: string;
  route: string;
  status: 'Active' | 'Inactive';
  assignedDate?: string;
  phoneNumber?: string;
}

// Vehicle View Details Props
export interface VehicleViewDetailsProps {
  vehicleData: IVehicleData | null;
  onClose: () => void;
}
