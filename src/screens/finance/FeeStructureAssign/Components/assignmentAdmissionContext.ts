import type {
  AssignmentContext,
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';

import { endOfServiceMonth, serializeServiceDate } from './assignmentServiceDates';

export function admissionServicePeriods(
  candidate: AssignmentCandidate,
  context?: AssignmentContext,
  optionalHeadIds: string[] = context?.selectedOptionalFeeHeadIds ?? []
): AssignmentServicePeriod[] {
  if (
    !context?.applicationId ||
    !context.joiningDate ||
    !context.chargeStartDate ||
    !context.chargeEndDate
  )
    return [];
  const { applicationId } = context;
  const actualJoining = dayjs(context.joiningDate.slice(0, 10));
  const chargeStart = dayjs(context.chargeStartDate.slice(0, 10));
  const joining = actualJoining.isAfter(chargeStart, 'day') ? actualJoining : chargeStart;
  const boardStart = candidate.boardStartDate && dayjs(candidate.boardStartDate.slice(0, 10));
  const start = boardStart && boardStart.isAfter(joining, 'day') ? boardStart : joining;
  const end = dayjs((candidate.boardEndDate ?? context.chargeEndDate).slice(0, 10));
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];
  return candidate.heads
    .filter((head) => !head.isOptional || optionalHeadIds.includes(head.feeHeadId))
    .map((head) => ({
      feeHeadId: head.feeHeadId,
      source: 'Registration',
      sourceReferenceId: applicationId,
      startDate: serializeServiceDate(start),
      endDate: serializeServiceDate(
        head.isOneTime || head.usesSingleServiceMonth ? endOfServiceMonth(start, end) : end
      ),
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
    ...(candidate.boardStartDate &&
      candidate.boardEndDate && {
        chargePeriodSource: 'BoardAcademicYear',
        chargeStartDate: candidate.boardStartDate,
        chargeEndDate: candidate.boardEndDate,
      }),
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
  context?: AssignmentContext,
  previousSource?: AssignmentRequest
): AssignmentRequest {
  const confirmed = context?.status !== 'Assigned' && context?.structureId === candidate.id;
  const { selectedOptionalFeeHeadIds } = next;
  const includedHeads = new Set(
    candidate.heads
      .filter((head) => !head.isOptional || selectedOptionalFeeHeadIds.includes(head.feeHeadId))
      .map((head) => head.feeHeadId)
  );
  const included = (head: { feeHeadId: string }) => includedHeads.has(head.feeHeadId);
  const verifiedHeads = new Set(
    next.servicePeriods
      .filter(
        (period) =>
          period.source === 'Registration' ||
          (current.editAssignmentId && period.source === 'TransportService')
      )
      .map((period) => period.feeHeadId)
  );
  const servicePeriods = next.servicePeriods.filter(
    (period) =>
      period.source !== 'Registration' &&
      (!current.editAssignmentId || period.source !== 'TransportService') &&
      included(period)
  );
  if (current.editAssignmentId)
    servicePeriods.push(
      ...current.servicePeriods.filter(
        (period) => verifiedHeads.has(period.feeHeadId) && includedHeads.has(period.feeHeadId)
      )
    );
  if (current.editAssignmentId) {
    const optionalHeads = new Set(
      candidate.heads.filter((head) => head.isOptional).map((head) => head.feeHeadId)
    );
    const previousPeriods = new Map(
      previousSource?.servicePeriods.map((period) => [period.feeHeadId, period])
    );
    const nextPeriods = new Map(next.servicePeriods.map((period) => [period.feeHeadId, period]));
    const currentPeriods = new Map(
      current.servicePeriods.map((period) => [period.feeHeadId, period])
    );
    servicePeriods.splice(0);
    includedHeads.forEach((feeHeadId) => {
      if (!optionalHeads.has(feeHeadId)) {
        const saved = currentPeriods.get(feeHeadId);
        if (saved) servicePeriods.push(saved);
        return;
      }
      const proposed = nextPeriods.get(feeHeadId);
      const explicitlyChanged =
        previousSource &&
        JSON.stringify(previousPeriods.get(feeHeadId)) !== JSON.stringify(proposed);
      const foreignVerified =
        current.studentId !== next.studentId &&
        (proposed?.source === 'Registration' || proposed?.source === 'TransportService');
      const period =
        explicitlyChanged && !foreignVerified
          ? proposed
          : (currentPeriods.get(feeHeadId) ?? (foreignVerified ? undefined : proposed));
      if (period) servicePeriods.push(period);
    });
  }
  const explicitHeadIds = new Set(servicePeriods.map((period) => period.feeHeadId));
  const variableAmounts = new Map(
    (confirmed ? (current.variableFeeHeads ?? []) : [])
      .filter(included)
      .map((head) => [head.feeHeadId, head])
  );
  (next.variableFeeHeads ?? [])
    .filter(included)
    .forEach((head) => variableAmounts.set(head.feeHeadId, head));
  const fixedAmounts = current.editAssignmentId ? current.feeHeadDetails : next.feeHeadDetails;
  return {
    ...next,
    studentId: current.studentId,
    editAssignmentId: current.editAssignmentId,
    assignmentConcurrencyStamp: current.assignmentConcurrencyStamp,
    previewToken: undefined,
    selectedOptionalFeeHeadIds,
    variableFeeHeads: [...variableAmounts.values()],
    feeHeadDetails: fixedAmounts.filter(included),
    servicePeriods: [
      ...servicePeriods,
      ...admissionServicePeriods(candidate, context, selectedOptionalFeeHeadIds).filter(
        (period) => !explicitHeadIds.has(period.feeHeadId)
      ),
    ],
  };
}
