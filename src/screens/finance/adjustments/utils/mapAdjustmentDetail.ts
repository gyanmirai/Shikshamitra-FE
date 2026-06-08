import { AdjustmentStatusEnum } from '../enums/adjustment.enum';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { FeeAdjustmentDetailDto } from '../types/adjustmentApi.types';

export const mapDetailToAdjustmentRequest = (
  detail: FeeAdjustmentDetailDto
): AdjustmentRequest => ({
  id: detail.id,
  studentId: detail.studentId,
  studentName: detail.studentName,
  studentGrNo: detail.studentGrNo?.toString(),
  className: detail.className,
  divisionName: detail.divisionName,
  rollNumber: detail.rollNo,
  contactNo: detail.contactNo,
  adjustmentType: detail.adjustmentTypeName,
  adjustmentAmount: detail.requestedAmount,
  reason: detail.reason,
  remarks: detail.remarks,
  status: detail.status,
  requestedBy: detail.requestedByName ?? '',
  requestedByUserId: detail.requestedByUserId,
  approvedBy: detail.processedByName,
  approvedAt: detail.processedAt,
  rejectionReason: detail.rejectionReason,
  createdAt: detail.createdAt,
  appliedAmount: detail.appliedAmount,
  remainingAdjustmentBalance: detail.remainingAmount,
  applicationLines: detail.targetAllocations.map((a) => ({
    installmentId: a.dueFeeId,
    dueFeeId: a.dueFeeId,
    feeHeadId: a.feeHeadId,
    feeHeadName: a.feeHeadName,
    installmentLabel: a.installmentLabel,
    originalPendingAmount: 0,
    appliedAmount: a.amount,
    finalPendingAmount: 0,
  })),
  paidFeeDetails: detail.sourceLines.map((s) => ({
    receiptNo: detail.voucherNumber,
    paymentDate: detail.createdAt,
    paidAmount: s.paidAmount,
    feeType: s.feeHeadName,
    installment: s.installmentLabel,
  })),
});

export const isPendingStatus = (status: AdjustmentStatusEnum) =>
  status === AdjustmentStatusEnum.Pending;
