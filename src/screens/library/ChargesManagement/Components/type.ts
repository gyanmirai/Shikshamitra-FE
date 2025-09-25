import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { LibraryChargeStatusType } from 'src/enums/library_charges_type';

export interface ILibraryChargeData {
  memberId: string;
  memberName: string;
  rollNo?: string;
  contactNo?: string;
  role: string; // restrict to roles (can extend later)
  chargeCategory: string;
  fineAmount: number; // ₹ value, use number for consistency
  reason: string;
  status: LibraryChargeStatusType; // enum for statuses
  classNo?: string;
  division?: string;
  dueDate?: Dayjs | string;
  assignAt?: Dayjs | string;
  returnDate?: Dayjs | string;
  paymentDetails?: {
    notes?: string;
    paymentAmount?: number | null;
    paymentMethod?: string;
  };
  bookTitle?: string;
}

export interface IAssignChargesFormProps {
  open: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: ILibraryChargeData | null;
}

export interface IAssignLibraryChargesFormValues {
  role: string;

  // Student-specific
  class: string;
  division: string;
  member: string;

  // Book details
  bookTitle: string;

  // Charge details
  chargeCategory: string;
  amount: string;
  dueDate: string;
  reason: string;
}

export interface ICollectChargesProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  charge: ILibraryChargeData | null;
}

export interface ICollectChargesFormValues {
  role: string;
  class: string;
  division: string;
  memberName: string;
  bookTitle: string;
  chargeCategory: string;
  fineAmount: number;
  dueDate: string | Dayjs;
  reason: string;
  paymentDetails: {
    paymentMethod: string;
    paymentAmount: number | null;
    notes: string;
  };
}
