import type {
  AssignmentContext,
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

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
            zeroAmountReason: h.zeroAmountReason,
          }))
      : [],
    servicePeriods: sameStructure
      ? saved.heads.filter((h) => h.included && h.servicePeriod).map((h) => h.servicePeriod!)
      : [],
    feeHeadDetails: [],
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
