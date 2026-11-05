import type { AdjustmentRequest } from '../types/adjustment.types';
import type { FeeAdjustmentApplicationItemDto } from '../types/adjustmentApi.types';

export function mapAdjustmentApplicationItem(
  item: FeeAdjustmentApplicationItemDto
): AdjustmentRequest {
  return {
    id: item.id,
    availableActions: item.availableActions,
    unavailableReason: item.unavailableReason,
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
    status: item.status,
    requestedBy: item.requestedByName ?? '',
    requestedByUserId: item.requestedByUserId ?? undefined,
    createdAt: item.createdAt,
  };
}
