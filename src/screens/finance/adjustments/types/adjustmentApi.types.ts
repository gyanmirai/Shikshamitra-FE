import type { AdjustmentStatusEnum } from '../enums/adjustment.enum';

export interface GetFeeAdjustmentApplicationsInput {
  boardId: string;
  educationMediumId: string;
  academicYearId: string;
  standardId?: string;
  divisionId?: string;
  status?: AdjustmentStatusEnum;
  completedOnly?: boolean;
  filter?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateFeeAdjustmentSourceLineDto {
  dueFeeId: string;
  amount: number;
}

export interface CreateFeeAdjustmentDto {
  studentId: string | number;
  reason?: string;
  remarks?: string;
  sourceLines: CreateFeeAdjustmentSourceLineDto[];
}

export interface AdjustmentEligibilityMonthDto {
  dueFeeId: string;
  month: number;
  year: number;
  total: number;
  paid: number;
  refunded: number;
  adjusted: number;
  adjustable: number;
}

export interface AdjustmentEligibilityFeeHeadDto {
  feeHeadId: string;
  feeHeadName: string;
  totalPaid: number;
  totalAdjustable: number;
  months: AdjustmentEligibilityMonthDto[];
}

export interface AdjustmentEligibilityDto {
  studentId: string;
  academicYearId: string;
  totalPaid: number;
  totalAdjustable: number;
  totalAlreadyAdjusted: number;
  feeHeads: AdjustmentEligibilityFeeHeadDto[];
}

export interface FeeAdjustmentApplicationItemDto {
  id: string;
  studentId: string;
  studentName: string;
  grNumber: string;
  rollNo: string;
  standardName: string;
  divisionName: string;
  adjustmentType: number;
  adjustmentTypeName: string;
  requestedAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  status: AdjustmentStatusEnum;
  statusName: string;
  requestedByName?: string;
  createdAt: string;
}

export interface FeeAdjustmentApplicationsDto {
  pendingCount: number;
  partiallyAppliedCount: number;
  appliedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: FeeAdjustmentApplicationItemDto[];
}

export interface FeeAdjustmentSourceLineDto {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  month: number;
  year: number;
  paidAmount: number;
  adjustableAmount: number;
  requestedAmount: number;
}

export interface FeeAdjustmentTargetAllocationDto {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  month: number;
  year: number;
  amount: number;
  applyBatchNumber: number;
  appliedOn: string;
}

export interface FeeAdjustmentDetailDto {
  id: string;
  voucherNumber: string;
  studentId: string;
  studentName: string;
  studentGrNo?: number;
  rollNo?: string;
  className?: string;
  divisionName?: string;
  contactNo?: string;
  academicYearId: string;
  adjustmentType: number;
  adjustmentTypeName: string;
  reason: string;
  remarks?: string;
  status: AdjustmentStatusEnum;
  statusName: string;
  requestedAmount: number;
  appliedAmount: number;
  remainingAmount: number;
  requestedByUserId?: string;
  requestedByName?: string;
  processedByUserId?: string;
  processedByName?: string;
  processedAt?: string;
  rejectionReason?: string;
  approverNotes?: string;
  createdAt: string;
  sourceLines: FeeAdjustmentSourceLineDto[];
  targetAllocations: FeeAdjustmentTargetAllocationDto[];
}

export interface FeeAdjustmentPendingFeeDto {
  installmentId: string;
  dueFeeId: string;
  installmentLabel: string;
  monthOrder: number;
  feeHeadId: string;
  feeHeadName: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  dueAmount: number;
  maxApplicableAmount: number;
}

export interface FeeAdjustmentApplyContextDto {
  adjustmentId: string;
  studentId: string;
  approvedAmount: number;
  remainingAmount: number;
  totalPendingFees: number;
  pendingFees: FeeAdjustmentPendingFeeDto[];
}

export interface ApplyFeeAdjustmentLineDto {
  dueFeeId: string;
  feeHeadId: string;
  installmentLabel?: string;
  appliedAmount: number;
}

export interface ApplyFeeAdjustmentDto {
  approvalNotes?: string;
  allowPartialApply?: boolean;
  lines: ApplyFeeAdjustmentLineDto[];
}

export interface ApplyFeeAdjustmentLineResultDto {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  originalPendingAmount: number;
  appliedAmount: number;
  finalPendingAmount: number;
}

export interface ApplyFeeAdjustmentResultDto {
  adjustmentId: string;
  status: AdjustmentStatusEnum;
  statusName: string;
  totalAppliedAmount: number;
  remainingAmount: number;
  appliedInThisBatch: number;
  selectedInstallmentsCount: number;
  lines: ApplyFeeAdjustmentLineResultDto[];
  processedAt: string;
  processedByUserId: string;
  processedByName?: string;
}

export interface RejectFeeAdjustmentDto {
  message: string;
}

export interface RejectFeeAdjustmentResultDto {
  adjustmentId: string;
  status: AdjustmentStatusEnum;
  statusName: string;
  rejectedAt: string;
  rejectionReason: string;
}
