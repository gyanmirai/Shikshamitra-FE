import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

export type VehicleStatusType = 'Active' | 'Inactive' | 'Maintenance';

export const VehicleStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Maintenance', value: 'Maintenance' },
];

export const VehicleStatusTypeColors: Record<VehicleStatusType, LabelColor> = {
  Active: 'success',
  Inactive: 'error',
  Maintenance: 'warning',
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
  registrationNo: string;
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
  isAC?: boolean;
  isNonAC?: boolean;
  description?: string | null;

  // Documents step
  documents?: {
    registrationCertificate?: File | null;
    insuranceCertificate?: File | null;
    fitnessCertificate?: File | null;
    vehiclePhotos?: File | null;
    [key: string]: File | null | undefined;
  };

  // Maintenance step
  maintenance?: IVehicleMaintenance;

  insuranceCompany: string;
  policyNo: string;
  insuranceIssueDate: Dayjs | null;
  insuranceExpiryDate: Dayjs | null;
  coverageAmount: number | null;

  pucCertificateNo: string;
  pucIssueDate: Dayjs | null;
  pucExpiryDate: Dayjs | null;

  fitnessCertificateNo: string;
  fitnessIssueDate: Dayjs | null;
  fitnessExpiryDate: Dayjs | null;

  roadTaxReceiptNo: string;
  roadTaxIssueDate: Dayjs | null;
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
