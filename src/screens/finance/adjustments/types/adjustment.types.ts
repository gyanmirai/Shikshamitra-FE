import type { AdjustmentStatusEnum } from '../enums/adjustment.enum';

/** @deprecated Use AdjustmentStatusEnum instead */
export type AdjustmentStatus = AdjustmentStatusEnum;

export interface PaidFeeDetail {
  receiptNo: string;
  paymentDate: string;
  paidAmount: number;
  feeType: string;
  installment?: string;
}

export interface AdjustmentApplicationRecord {
  installmentId: string;
  dueFeeId?: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  originalPendingAmount: number;
  appliedAmount: number;
  finalPendingAmount: number;
}

export interface AdjustmentAuditTrail {
  action: 'AdjustmentApproved' | 'AdjustmentApplied' | 'PendingFeesUpdated';
  message: string;
  actor: string;
  createdAt: string;
}

export interface AdjustmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentGrNo?: string;
  className?: string;
  divisionName?: string;
  rollNumber?: string;
  contactNo?: string;
  adjustmentType: string;
  adjustmentAmount: number;
  reason: string;
  remarks?: string;
  status: AdjustmentStatus;
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  paidFeeDetails?: PaidFeeDetail[];
  totalPaidFees?: number;
  appliedAmount?: number;
  remainingAdjustmentBalance?: number;
  selectedInstallmentsCount?: number;
  applicationLines?: AdjustmentApplicationRecord[];
  auditTrail?: AdjustmentAuditTrail[];
}

export interface IAdjustmentGeneralValues {
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string;
  studentName: string;
  grNo: string;
  totalPaidFees: number | '';
  paidFeeDetails: PaidFeeDetail[];
}

export interface AdjustmentFormValues {
  adjustmentType: string;
  adjustmentAmount: number | '';
  reason: string;
  remarks: string;
}

export interface IAdjustmentTableProps {
  data: AdjustmentRequest[];
  selectedBoard: string;
  setSelectedBoard: (v: string) => void;
  selectedMedium: string;
  setSelectedMedium: (v: string) => void;
  onCreateAdjustment: (row: AdjustmentRequest) => void;
  onView: (row: AdjustmentRequest) => void;
}

export interface IAdjustmentFormProps {
  onCancel: (e: any, isSubmit?: boolean) => void;
  onSubmit: (values: AdjustmentFormValues & IAdjustmentGeneralValues) => void;
}

export interface IAdjustmentViewProps {
  student: AdjustmentRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export interface IAdjustmentApproveRejectProps {
  mode: 'Approve' | 'Reject' | string;
  onClose: (e: any, isSubmit?: boolean, notes?: string) => void;
}
