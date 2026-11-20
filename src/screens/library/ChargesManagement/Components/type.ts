import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { LibraryChargeStatusType } from 'src/enums/library_charges_type';

export interface ILibraryChargeData {
  id: any;
  memberId: string;
  memberName: string;
  academicYearId?: string | null;
  schoolChargeDate?: string | null;
  schoolDueDate?: string | null;
  chargeDateProvenance?: number;
  dueDateProvenance?: number;
  rawChargeDate?: string | null;
  rawDueDate?: string | null;
  sourceVersion?: string;
  financeSourceLinkId?: string | null;
  rollNo?: string;
  grNo?: string;
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
  onBusyChange?: (busy: boolean) => void;
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
