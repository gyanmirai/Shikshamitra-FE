import type {
  AssessmentBookingPreview,
  AssessmentSharedSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { it, vi, expect } from 'vitest';
import { sessionResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { createAndBookPipelineAssessment } from './assessment-pipeline-booking-model';

import type { PipelineBookingRetry } from './assessment-pipeline-booking-model';

const session: AssessmentSharedSessionInput = {
  name: 'Class 1 exam',
  sessionType: 'exam',
  scopes: [{ admissionOfferingId: 'offering', workflowStageDefinitionId: 'definition' }],
  startsAt: '2999-01-01T10:00:00Z',
  endsAt: '2999-01-01T11:00:00Z',
  location: 'A102',
  roomId: 'room',
  capacity: 30,
};
const target = { applicationId: 'app', stageInstanceId: 'stage', applicationNumber: 'APP-1' };
const candidate = {
  ...target,
  applicantName: 'Student',
  admissionOfferingId: 'offering',
  workflowStageDefinitionId: 'definition',
  concurrencyStamp: 'fresh-stamp',
};
const preview: AssessmentBookingPreview = {
  items: [candidate],
  proposedBookings: [
    { ...candidate, applicationId: 'another-app', stageInstanceId: 'another-stage' },
  ],
  totalCount: 1,
  eligibleCount: 5,
  availableCount: 30,
  remainingCount: 4,
  requiresRoomApproval: false,
  roomName: 'A102',
  buildingName: 'Main',
  floorName: 'First',
  previewFingerprint: 'fingerprint',
  slots: [],
  warnings: [],
};
const services = () => ({
  preview: vi.fn().mockResolvedValue(preview),
  confirm: vi.fn().mockResolvedValue({ session: sessionResponse, bookedCount: 1 }),
});

it('creates and books only the current student, never the global proposed applicants', async () => {
  const api = services();
  await createAndBookPipelineAssessment(session, target, api, {});
  expect(api.preview).toHaveBeenCalledWith(session, target.applicationNumber);
  expect(api.confirm).toHaveBeenCalledWith({
    session,
    previewFingerprint: 'fingerprint',
    idempotencyKey: expect.any(String),
    bookings: [{ applicationId: 'app', stageInstanceId: 'stage', concurrencyStamp: 'fresh-stamp' }],
  });
});

it.each([
  { items: [], message: 'no longer eligible' },
  { items: [{ ...candidate, stageInstanceId: 'different-stage' }], message: 'no longer eligible' },
  { availableCount: 0, message: 'no longer eligible' },
  { requiresRoomApproval: true, message: 'Room approval is required' },
])(
  'does not create a session when the applicant or room is unavailable: $message',
  async ({ message, ...override }) => {
    const api = services();
    api.preview.mockResolvedValue({ ...preview, ...override });
    await expect(createAndBookPipelineAssessment(session, target, api, {})).rejects.toThrow(
      message
    );
    expect(api.confirm).not.toHaveBeenCalled();
  }
);

it('replays the exact confirmation and key after a lost response without creating another preview', async () => {
  const api = services();
  const retry: PipelineBookingRetry = {};
  api.confirm.mockRejectedValueOnce(new Error('Response lost'));
  await expect(createAndBookPipelineAssessment(session, target, api, retry)).rejects.toThrow(
    'Response lost'
  );
  const sent = api.confirm.mock.calls[0][0];
  await createAndBookPipelineAssessment(session, target, api, retry);
  expect(api.confirm).toHaveBeenLastCalledWith(sent);
  expect(api.preview).toHaveBeenCalledOnce();
});

it('refreshes eligibility and confirmation after a definitive concurrency rejection', async () => {
  const api = services();
  const retry: PipelineBookingRetry = {};
  api.confirm.mockRejectedValueOnce({ status: 409 });
  await expect(createAndBookPipelineAssessment(session, target, api, retry)).rejects.toEqual({
    status: 409,
  });
  const sent = api.confirm.mock.calls[0][0];
  api.preview.mockResolvedValue({ ...preview, previewFingerprint: 'fresh-fingerprint' });
  await createAndBookPipelineAssessment(session, target, api, retry);
  expect(api.preview).toHaveBeenCalledTimes(2);
  expect(api.confirm.mock.calls[1][0].idempotencyKey).not.toBe(sent.idempotencyKey);
  expect(api.confirm.mock.calls[1][0].previewFingerprint).toBe('fresh-fingerprint');
});
