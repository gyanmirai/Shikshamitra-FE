import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentBookingPreview,
  AssessmentSelectedBooking,
  AssessmentSharedSessionInput,
  AssessmentSessionConfirmation,
} from 'src/redux/student/admissions/admission-assessment-types';

export function sessionBookingInput(session: AssessmentSession): AssessmentSharedSessionInput {
  return {
    name: session.name,
    sessionType: session.sessionType ?? 'exam',
    roomId: session.roomId ?? '',
    scopes: session.scopes?.length
      ? session.scopes
      : [
          {
            admissionOfferingId: session.admissionOfferingId,
            workflowStageDefinitionId: session.workflowStageDefinitionId,
          },
        ],
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    location: session.location,
    capacity: session.capacity,
    interviewerId: session.interviewerId,
    slotDurationMinutes: session.slotDurationMinutes,
    breakMinutes: session.breakMinutes,
    concurrencyStamp: session.concurrencyStamp,
  };
}

export const studentBookingKey = (
  row: Pick<AssessmentRosterItem, 'applicationId' | 'stageInstanceId'>
) => `${row.applicationId}:${row.stageInstanceId}`;

export function selectedStudentScopes(rows: AssessmentRosterItem[], scopes: AssessmentScope[]) {
  return scopes.filter((scope) =>
    rows.some(
      (row) =>
        row.admissionOfferingId === scope.admissionOfferingId &&
        row.workflowStageDefinitionId === scope.workflowStageDefinitionId
    )
  );
}

export function studentBookingReason(
  row: AssessmentRosterItem,
  session?: AssessmentSharedSessionInput
) {
  if (!row.isActive || !row.assessment.policy) return 'This assessment is read-only.';
  if (!row.assessment.canBook) return 'Booking is not available for this assessment.';
  if (!row.assessment.policy.schedulingEnabled)
    return 'This assessment does not require a session.';
  if (!row.admissionOfferingId || !row.workflowStageDefinitionId)
    return 'Refresh this student’s assessment details.';
  if (
    session &&
    !session.scopes.some(
      (scope) =>
        scope.admissionOfferingId === row.admissionOfferingId &&
        scope.workflowStageDefinitionId === row.workflowStageDefinitionId
    )
  )
    return 'This session is for a different assessment.';
  return '';
}

export function reviewStudentBooking(
  rows: AssessmentRosterItem[],
  input: AssessmentSharedSessionInput,
  preview: AssessmentBookingPreview
) {
  const pupils = new Set<string>();
  const times = new Set<string>();
  const items = rows.map((row) => {
    const candidate = preview.items.find(
      (item) => studentBookingKey(item) === studentBookingKey(row)
    );
    const proposal = preview.proposedBookings.find(
      (item) => studentBookingKey(item) === studentBookingKey(row)
    );
    let reason = studentBookingReason(row, input);
    if (!reason && pupils.has(row.applicantId))
      reason = 'This student is already selected through another application.';
    pupils.add(row.applicantId);
    if (!reason && !candidate)
      reason = 'No longer eligible for this session. Refresh student details.';
    if (!reason && input.sessionType === 'individualInterview') {
      if (!proposal?.slotStartsAt || times.has(proposal.slotStartsAt))
        reason = 'No distinct interview time is available. Choose another session.';
      else times.add(proposal.slotStartsAt);
    }
    return {
      row,
      reason,
      candidate,
      slotStartsAt: proposal?.slotStartsAt ?? undefined,
      slotEndsAt: proposal?.slotEndsAt ?? undefined,
    };
  });
  const bookings: AssessmentSelectedBooking[] = items
    .filter((item) => !item.reason && item.candidate)
    .map(({ row, candidate, slotStartsAt }) => ({
      applicationId: row.applicationId,
      stageInstanceId: row.stageInstanceId,
      concurrencyStamp: candidate!.concurrencyStamp,
      slotStartsAt,
    }));
  const capacityError =
    rows.length > preview.availableCount
      ? `Only ${preview.availableCount} seats / slots available for ${rows.length} selected students.`
      : '';
  return {
    items,
    bookings,
    capacityError,
    canConfirm:
      rows.length > 0 && rows.length <= 100 && bookings.length === rows.length && !capacityError,
  };
}

export type StudentBookingCommand = {
  session: AssessmentSharedSessionInput;
  sessionId?: string;
  sessionConcurrencyStamp?: string;
  previewFingerprint: string;
  bookings: AssessmentSelectedBooking[];
};
export type StudentBookingRetry = {
  payload?: string;
  command?: StudentBookingCommand & { idempotencyKey: string };
};

export async function confirmStudentBooking(
  command: StudentBookingCommand,
  confirm: (
    input: StudentBookingCommand & { idempotencyKey: string }
  ) => Promise<AssessmentSessionConfirmation>,
  retry: StudentBookingRetry
) {
  const payload = JSON.stringify({ ...command, idempotencyKey: undefined });
  if (retry.payload !== payload || !retry.command) {
    retry.payload = payload;
    retry.command = { ...command, idempotencyKey: crypto.randomUUID() };
  }
  try {
    return await confirm(retry.command);
  } catch (failure) {
    const status =
      failure && typeof failure === 'object' && 'status' in failure ? failure.status : undefined;
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408)
      delete retry.command;
    throw failure;
  }
}
