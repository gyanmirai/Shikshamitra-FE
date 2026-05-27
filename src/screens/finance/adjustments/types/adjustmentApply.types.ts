export interface AdjustmentPendingFeeDto {
  installmentId: string;
  dueFeeId?: string;
  installmentLabel: string;
  monthOrder: number;
  feeHeadId: string;
  feeHeadName: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  dueAmount?: number;
}

export interface AdjustmentApplyItem {
  installmentId: string;
  dueFeeId?: string;
  installmentLabel: string;
  monthOrder: number;
  feeHeadId: string;
  feeHeadName: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  adjustableAmount: number;
  appliedAmount: number;
  finalPendingAmount: number;
  isSelected: boolean;
}

export interface AdjustmentApplySummary {
  approvedAdjustmentAmount: number;
  selectedInstallmentsCount: number;
  totalPendingFees: number;
  totalAppliedAmount: number;
  remainingAdjustmentBalance: number;
}

export interface AdjustmentApplicationLineInput {
  installmentId: string;
  dueFeeId?: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  originalPendingAmount: number;
  appliedAmount: number;
  finalPendingAmount: number;
}

export interface ApplyAdjustmentRequestInput {
  adjustmentId: string;
  studentId: string;
  approvedBy: string;
  approvalNotes?: string;
  totalAppliedAmount: number;
  remainingAdjustmentBalance: number;
  lines: AdjustmentApplicationLineInput[];
}

export interface AdjustmentAuditLogInput {
  adjustmentId: string;
  action: 'AdjustmentApproved' | 'AdjustmentApplied' | 'PendingFeesUpdated';
  message: string;
  actor: string;
  meta?: Record<string, unknown>;
}

export interface ApplyAdjustmentDialogSubmitResult {
  totalAppliedAmount: number;
  remainingAdjustmentBalance: number;
  selectedInstallmentsCount: number;
  lines: AdjustmentApplicationLineInput[];
}
