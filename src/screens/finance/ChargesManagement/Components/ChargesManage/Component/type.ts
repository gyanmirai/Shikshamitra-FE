import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// Batch list item returned by GET /charges (inbox)
export interface IChargeData {
  chargeId: string;
  chargeName?: string;
  chargeCategoryId?: string;
  categoryName?: string;
  amount: number;
  priority?: number;
  dueDate: string;
  status?: number;
  purposeDescription: string;
  additionalNotes?: string;
  studentCount?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  partiallyProcessed?: boolean;
  boardId?: string;
  educationMediumId?: string;
  requestorName?: string;
  requestedOn?: string;
	concurrencyStamp?: string;
	availableActions?: string[];
  // Legacy per-student fields (charge lines view)
  studentId?: string;
  studentName?: string;
  grNumber?: string;
  rollNumber?: number;
  standardName?: string;
  standardId?: string;
  divisionId?: string;
  divisionName?: string;
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
  chargeName?: string;
	concurrencyStamp?: string;
	availableActions?: string[];
  audience?: {
    scope?: {
      boardId?: string;
      educationMediumId?: string;
      classIds?: string[];
      divisionIds?: string[];
    };
    selection?: {
      mode?: string | number;
      studentIds?: string[];
    };
  };
  students?: Array<{
    studentId?: string;
    studentName?: string;
    grNumber?: string;
    rollNumber?: number;
    standardName?: string;
    divisionName?: string;
    status?: number;
  }>;
  appliedCount?: number;
  isApprovalRequired?: boolean;
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
