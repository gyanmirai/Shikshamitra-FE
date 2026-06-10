import { AdjustmentStatusEnum } from '../enums/adjustment.enum';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { FeeAdjustmentApplicationItemDto } from '../types/adjustmentApi.types';

function mapStatus(status: number, statusName: string): AdjustmentStatusEnum {
  if (status === 0) return AdjustmentStatusEnum.Pending;
  if (status === 1) return AdjustmentStatusEnum.Rejected;
  if (statusName.toLowerCase().includes('reject')) return AdjustmentStatusEnum.Rejected;
  return AdjustmentStatusEnum.Approved;
}

export function mapAdjustmentApplicationItem(
  item: FeeAdjustmentApplicationItemDto
): AdjustmentRequest {
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.studentName,
    studentGrNo: item.grNumber,
    className: item.standardName,
    divisionName: item.divisionName,
    rollNumber: item.rollNo,
    adjustmentType: item.adjustmentTypeName,
    adjustmentAmount: item.requestedAmount,
    appliedAmount: item.appliedAmount,
    remainingAdjustmentBalance: item.remainingAmount,
    reason: '',
    status: mapStatus(item.status, item.statusName),
    requestedBy: item.requestedByName ?? '',
    createdAt: item.createdAt,
  };
}
