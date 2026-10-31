import type {
  AssignmentContext,
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

export function admissionServicePeriods(
  candidate: AssignmentCandidate,
  context?: AssignmentContext,
  optionalHeadIds: string[] = context?.selectedOptionalFeeHeadIds ?? []
): AssignmentServicePeriod[] {
  if (!context?.joiningDate || !context.chargeStartDate || !context.chargeEndDate) return [];
  return candidate.heads
    .filter(
      (head) =>
        !head.isOneTime &&
        (!head.isOptional || optionalHeadIds.includes(head.feeHeadId)) &&
        context.admissionFeeHeadIds?.includes(head.feeHeadId)
    )
    .map((head) => ({
      feeHeadId: head.feeHeadId,
      source: 'Registration',
      sourceReferenceId: context.applicationId ?? undefined,
      startDate: context.chargeStartDate!,
      endDate: context.chargeEndDate!,
    }));
}

export function admissionAssignmentRequest(
  studentId: string,
  academicYearId: string,
  candidate: AssignmentCandidate,
  context?: AssignmentContext
): AssignmentRequest {
  const confirmed = context?.structureId === candidate.id;
  const selectedOptionalFeeHeadIds = confirmed ? (context.selectedOptionalFeeHeadIds ?? []) : [];
  return {
    studentId,
    academicYearId,
    standardFeeStructureId: candidate.id,
    selectedOptionalFeeHeadIds,
    servicePeriods: admissionServicePeriods(candidate, context, selectedOptionalFeeHeadIds),
    feeHeadDetails: [],
    variableFeeHeads: context?.structureId === candidate.id ? (context.variableFeeHeads ?? []) : [],
  };
}

// Bulk configuration can share fee choices; verified source dates belong to each student.
export function mergeAssignmentInputs(
  next: AssignmentRequest,
  current: AssignmentRequest,
  candidate: AssignmentCandidate,
  context?: AssignmentContext
): AssignmentRequest {
  const confirmed = context?.structureId === candidate.id;
  const selectedOptionalFeeHeadIds = confirmed
    ? context.selectedOptionalFeeHeadIds
    : next.selectedOptionalFeeHeadIds;
  const includedHeads = new Set(
    candidate.heads
      .filter((head) => !head.isOptional || selectedOptionalFeeHeadIds.includes(head.feeHeadId))
      .map((head) => head.feeHeadId)
  );
  const included = (head: { feeHeadId: string }) => !confirmed || includedHeads.has(head.feeHeadId);
  const servicePeriods = next.servicePeriods.filter(
    (period) => period.source !== 'Registration' && included(period)
  );
  const explicitHeadIds = new Set(servicePeriods.map((period) => period.feeHeadId));
  const variableAmounts = new Map(
    (confirmed ? (current.variableFeeHeads ?? []) : [])
      .filter(included)
      .map((head) => [head.feeHeadId, head])
  );
  (next.variableFeeHeads ?? [])
    .filter(included)
    .forEach((head) => variableAmounts.set(head.feeHeadId, head));
  return {
    ...next,
    studentId: current.studentId,
    previewToken: undefined,
    selectedOptionalFeeHeadIds,
    variableFeeHeads: [...variableAmounts.values()],
    feeHeadDetails: next.feeHeadDetails.filter(included),
    servicePeriods: [
      ...servicePeriods,
      ...admissionServicePeriods(candidate, context, selectedOptionalFeeHeadIds).filter(
        (period) => !explicitHeadIds.has(period.feeHeadId)
      ),
    ],
  };
}
