export type StudentSelectionMode = 'AllInScope' | 'Explicit';

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
  categoryName?: string;
  amount: number;
  dueDate: string;
  purposeDescription: string;
  status?: number;
  studentCount: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  partiallyProcessed?: boolean;
  boardId?: string;
  educationMediumId?: string;
  requestorName?: string;
  requestedOn?: string;
  additionalNotes?: string;
}

export interface IChargeLineListItem extends IChargeBatchListItem {
  chargeLineId: string;
  studentId: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: string | number;
  standardName?: string;
  divisionName?: string;
}

export interface IChargeStudentLine {
  studentId: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: number;
  standardName?: string;
  divisionName?: string;
  status: number;
}

export interface IChargeDetail extends IChargeBatchListItem {
  chargeCategoryId: string;
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

export interface ICreateChargeRequest {
  chargeName: string;
  chargeCategoryId: string;
  purposeDescription: string;
  amount: number;
  dueDate: string;
  priority?: number;
  additionalNotes?: string;
  audience: IChargeAudience;
}
