import type { ChargeWorkflowStatus } from 'src/enums/fee-charges-status';

export type StudentSelectionMode = 'AllInScope' | 'Explicit';
export type ChargeAction = 'View' | 'Edit' | 'Delete' | 'Approve' | 'Reject' | 'Void';

export interface IAcademicScope {
  boardId: string;
  educationMediumId: string;
  classIds: string[];
  divisionIds?: string[];
}

export interface IStudentSelection {
  mode: StudentSelectionMode | number;
  studentIds?: string[];
}

export interface IChargeAudience {
  scope: IAcademicScope;
  selection: IStudentSelection;
}

export interface IChargeBatchListItem {
  chargeId: string;
  chargeName: string;
  chargeCategoryId?: string;
  incomeCategoryId?: string;
  receivingBankAccountId?: string;
  incomeCategoryName?: string;
  receivingBankLabel?: string;
  categoryName?: string;
  amount: number;
  dueDate: string;
  purposeDescription: string;
  /** 0 = Pending, 1 = In Process, 2 = Completed, 3 = Rejected */
  displayStatus: ChargeWorkflowStatus;
  workflowStatus: ChargeWorkflowStatus;
  studentCount: number;
  /** Lines no longer pending (approved + rejected) */
  processedCount: number;
  boardId?: string;
  educationMediumId?: string;
  requestorName?: string;
  requestedOn?: string;
  additionalNotes?: string;
  concurrencyStamp: string;
  availableActions: ChargeAction[];
}

export interface IChargeLineListItem extends IChargeBatchListItem {
  chargeLineId: string;
  studentId: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: string | number;
  standardName?: string;
  divisionName?: string;
  status: number;
  collectedAmount: number;
  waivedAmount: number;
  outstandingAmount: number;
}

export interface IChargeStudentLine {
  workflowStatus: ChargeWorkflowStatus;
  chargeLineId: string;
  studentId: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: number;
  standardName?: string;
  divisionName?: string;
  status: number;
  collectedAmount: number;
  waivedAmount: number;
  outstandingAmount: number;
}

export interface IChargeDetail extends IChargeBatchListItem {
  status: number;
  chargeCategoryId: string;
  incomeCategoryId: string;
  receivingBankAccountId: string;
  incomeCategoryName?: string;
  receivingBankLabel?: string;
  priority: number;
  additionalNotes?: string;
  audience: IChargeAudience;
  appliedCount: number;
  isApprovalRequired: boolean;
  students: IChargeStudentLine[];
  requestor?: {
    requestorId?: string;
    requestorName?: string;
    requestorRole?: string;
    requestedOn?: string;
  };
  approvalDetails?: {
    approvedBy?: string;
    approvedByName?: string;
    approvedOn?: string;
    approvalNotes?: string;
  };
}

export interface IChargeListResponse {
  success: boolean;
  items: IChargeBatchListItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  pendingCount: number;
  processedCount: number;
  inProcessCount: number;
  completedCount: number;
  rejectedCount: number;
  message: string;
}

export interface IChargeLineListResponse {
  success: boolean;
  items: IChargeLineListItem[];
  totalCount: number;
  message: string;
}

export interface IGetChargesParams {
  academicYearId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ChargeWorkflowStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  boardId?: string;
  educationMediumId?: string;
  standardId?: string;
  divisionId?: string;
  _refetchTrigger?: number;
}

export interface IGetChargeLinesParams {
  academicYearId: string;
  page?: number;
  pageSize?: number;
  status?: number;
  boardId?: string;
  educationMediumId?: string;
}

export interface ICreateChargeRequest {
  chargeName: string;
  chargeCategoryId: string;
  incomeCategoryId?: string;
  receivingBankAccountId?: string;
  incomeCategoryName?: string;
  receivingBankLabel?: string;
  purposeDescription: string;
  amount: number;
  dueDate: string;
  priority?: number;
  additionalNotes?: string;
  audience: IChargeAudience;
}

export interface IUpdateChargeRequest extends ICreateChargeRequest {
  concurrencyStamp: string;
}

export interface IChargeMutationResponse {
  success: boolean;
  data: {
    chargeId: string;
    status: number;
    workflowStatus: ChargeWorkflowStatus;
    processedCount?: number;
    remainingPendingCount?: number;
    concurrencyStamp?: string;
  };
  message: string;
}

export interface IChargeActionRequest {
  studentIds: string[];
  concurrencyStamp: string;
  approvalNotes?: string;
  rejectionReason?: string;
  reason?: string;
}
