import type {
  AssignmentContext,
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { admissionServicePeriods } from './assignmentAdmissionContext';

export function assignmentEditRequest(
  context: AssignmentContext,
  candidate: AssignmentCandidate,
  academicYearId: string
): AssignmentRequest {
  const saved = context.assignedAssignment;
  const sameStructure = saved?.structureId === candidate.id;
  return {
    studentId: context.studentId,
    academicYearId,
    standardFeeStructureId: candidate.id,
    ...(candidate.boardStartDate &&
      candidate.boardEndDate && {
        chargePeriodSource: 'BoardAcademicYear',
        chargeStartDate: candidate.boardStartDate,
        chargeEndDate: candidate.boardEndDate,
      }),
    editAssignmentId: context.assignmentId ?? undefined,
    assignmentConcurrencyStamp: context.assignmentConcurrencyStamp,
    editReason: '',
    selectedOptionalFeeHeadIds: sameStructure
      ? saved.heads.filter((h) => h.isOptional && h.included).map((h) => h.feeHeadId)
      : [],
    variableFeeHeads: sameStructure
      ? saved.heads
          .filter((h) => h.isVariable && h.included)
          .map((h) => ({
            feeHeadId: h.feeHeadId,
            amount: h.effectiveAmount,
            ...(h.amountBasis === 'MonthlyRate' && { isMonthlyRate: true }),
            zeroAmountReason: h.zeroAmountReason,
          }))
      : [],
    servicePeriods: sameStructure
      ? saved.heads.filter((h) => h.included && h.servicePeriod).map((h) => h.servicePeriod!)
      : admissionServicePeriods(candidate, context, []),
    feeHeadDetails: sameStructure
      ? saved.heads
          .filter(
            (head) =>
              head.isOptional &&
              !head.isVariable &&
              head.included &&
              head.effectiveAmount != null &&
              head.effectiveAmount !== head.configuredAmount
          )
          .map((head) => ({ feeHeadId: head.feeHeadId, amount: head.effectiveAmount }))
      : [],
    ...(saved && {
      policies: ['concession', 'refund', 'collection'].map((family) => ({
        family: family as 'concession' | 'refund' | 'collection',
        versionId: saved.policies.find((p) => p.family === family)?.versionId ?? null,
      })),
      policyOverrideReason: saved.policyOverrideReason,
    }),
  };
}

export function assignmentEditReasonError(request: AssignmentRequest): string | undefined {
  if (!request.editAssignmentId) return undefined;
  return !request.editReason?.trim() ? 'Enter a fee structure change reason.' : undefined;
}
