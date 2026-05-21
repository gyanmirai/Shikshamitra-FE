import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// Flat list item returned by GET /charges (list response)
export interface IChargeData {
  chargeId: string;
  chargeCategoryId: string;
  categoryName?: string;
  studentId: string;
  studentName?: string;
  grNumber?: string;
  rollNumber?: number;
  standardId?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
  boardId?: string;
  educationMediumId?: string;
  amount: number;
  priority: number;
  dueDate: string;
  status?: number;
  purposeDescription: string;
  additionalNotes?: string;
}

// Nested detail object returned by GET /charges/{chargeId}
export interface IChargeDetailData {
  chargeId?: string;
  id?: string;
  chargeCategoryId?: string;
  categoryName?: string;
  amount: number;
  priority: number;
  dueDate: string;
  status?: number;
  purposeDescription: string;
  additionalNotes?: string;
  appliedOn?: string;
  student?: {
    studentId?: string;
    studentName?: string;
    grNumber?: string;
    rollNumber?: number;
    standardName?: string;
    divisionName?: string;
    contactNumber?: string;
    emailAddress?: string;
  };
  requestor?: {
    requestorName?: string;
    requestorRole?: string;
    requestedOn?: string;
  };
  approvalDetails?: {
    approvalNotes?: string;
    approvedBy?: string;
    approvedOn?: string;
  };
  rejectionDetails?: {
    rejectionReason?: string;
    rejectedBy?: string;
    rejectedOn?: string;
  };
}

// Student-wise grouped view, derived client-side from IChargeData list
export interface IStudentChargeData {
  studentId: string;
  studentName: string;
  rollNumber?: number;
  grNumber?: string;
  standardName?: string;
  divisionName?: string;
  charges: IChargeData[];
}

export interface IChargeFormProps {
  open: UseBooleanReturn;
  onClose: (event?: any, reason?: boolean) => void;
  editData?: IChargeData | null;
  isEdit?: boolean;
}

export interface ViewChargeProps {
  charge: IChargeData | null;
  isActionShow?: boolean;
}

export interface RequestorInfoProps {
  charge: IChargeDetailData | null;
}
