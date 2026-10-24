import type { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import type { IAdjustmentFullFormValues } from './adjustmentFormValues';

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
  status: AdjustmentStatusEnum;
  requestedBy: string;
  requestedByUserId?: string;
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
  primaryAction?: React.ReactNode;
  activeTab: import('../enums/adjustment.enum').AdjustmentTabEnum;
  onTabChange: (tab: import('../enums/adjustment.enum').AdjustmentTabEnum) => void;
  tabCounts: Record<import('../enums/adjustment.enum').AdjustmentTabEnum, number>;
  onCreateAdjustment: () => void;
  onView: (row: AdjustmentRequest) => void;
  onApprove?: (row: AdjustmentRequest) => void;
  onReject?: (row: AdjustmentRequest) => void;
  academicFilters?: import('src/screens/finance/hooks/useFinanceAcademicFilters').UseFinanceAcademicFiltersResult;
}

export interface IAdjustmentFormProps {
  onCancel: (e: any, isSubmit?: boolean) => void;
  onSubmit: (values: IAdjustmentFullFormValues) => void;
  defaultBoardId?: string;
  defaultMediumId?: string;
  defaultStandardId?: string;
  defaultDivisionId?: string;
}

export interface IAdjustmentViewMeta {
  id: string;
  status: AdjustmentStatusEnum;
  requestedByUserId?: string;
}

export interface IAdjustmentViewProps {
  adjustmentId: string;
  viewMeta: IAdjustmentViewMeta;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  showApprove?: boolean;
  showReject?: boolean;
}

export interface IAdjustmentApproveRejectProps {
  mode: 'Approve' | 'Reject' | string;
  onClose: (e: any, isSubmit?: boolean, notes?: string) => void;
}
