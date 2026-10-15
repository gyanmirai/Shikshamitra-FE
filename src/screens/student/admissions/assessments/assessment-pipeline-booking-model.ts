import type {
  AssessmentBookingPreview,
  AssessmentSelectedBooking,
  AssessmentSharedSessionInput,
  AssessmentSessionConfirmation,
} from 'src/redux/student/admissions/admission-assessment-types';

export type PipelineBookingTarget = {
  applicationId: string;
  stageInstanceId: string;
  applicationNumber: string;
};
export type PipelineBookingCommand = {
  session: AssessmentSharedSessionInput;
  previewFingerprint: string;
  idempotencyKey: string;
  bookings: AssessmentSelectedBooking[];
};
export type PipelineBookingRetry = { input?: string; command?: PipelineBookingCommand };

/** Reuse shared atomic confirmation, restricted to the applicant currently being viewed. */
export async function createAndBookPipelineAssessment(
  session: AssessmentSharedSessionInput,
  target: PipelineBookingTarget,
  services: {
    preview: (
      session: AssessmentSharedSessionInput,
      search: string
    ) => Promise<AssessmentBookingPreview>;
    confirm: (command: PipelineBookingCommand) => Promise<AssessmentSessionConfirmation>;
  },
  retry: PipelineBookingRetry
) {
  const input = JSON.stringify({ session, target });
  if (retry.input !== input || !retry.command) {
    const preview = await services.preview(session, target.applicationNumber);
    const candidate = preview.items.find(
      (item) =>
        item.applicationId === target.applicationId &&
        item.stageInstanceId === target.stageInstanceId
    );
    if (!candidate || preview.availableCount < 1)
      throw new Error('This student is no longer eligible for this slot. Refresh and try again.');
    if (preview.requiresRoomApproval)
      throw new Error('Room approval is required before this slot can be booked.');
    retry.input = input;
    retry.command = {
      session,
      previewFingerprint: preview.previewFingerprint,
      idempotencyKey: crypto.randomUUID(),
      bookings: [
        {
          applicationId: candidate.applicationId,
          stageInstanceId: candidate.stageInstanceId,
          concurrencyStamp: candidate.concurrencyStamp,
        },
      ],
    };
  }
  try {
    return await services.confirm(retry.command);
  } catch (failure) {
    const status =
      failure && typeof failure === 'object' && 'status' in failure ? failure.status : undefined;
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408)
      delete retry.command;
    throw failure;
  }
}
