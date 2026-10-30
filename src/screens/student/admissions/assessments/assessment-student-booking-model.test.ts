import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentSession,
  AssessmentBookingPreview,
} from 'src/redux/student/admissions/admission-assessment-types';

import { it, vi, expect } from 'vitest';
import {
  sessionResponse,
  assessmentResponse,
} from 'src/redux/student/admissions/assessment-test-fixture';

import {
  sessionBookingInput,
  reviewStudentBooking,
  confirmStudentBooking,
} from './assessment-student-booking-model';

export const student = (id: string): AssessmentRosterItem => ({
  applicationId: id,
  stageInstanceId: `stage-${id}`,
  applicantId: id,
  applicationNumber: `APP-${id}`,
  applicantName: id,
  className: 'Class 10',
  admissionOfferingId: 'offering-1',
  workflowStageDefinitionId: 'definition-1',
  stageName: 'Entrance exam',
  applicationStatus: 0,
  stageStatus: 1,
  isActive: true,
  queue: 'toBook',
  assessment: {
    ...assessmentResponse,
    policy: { ...assessmentResponse.policy!, schedulingEnabled: true },
    applicationId: id,
    stageInstanceId: `stage-${id}`,
  },
});
export const session: AssessmentSession = {
  ...sessionResponse,
  roomId: 'room',
  sessionType: 'exam',
  startsAt: '2999-10-30T04:30:00Z',
  endsAt: '2999-10-30T05:30:00Z',
};
export const previewFor = (...ids: string[]): AssessmentBookingPreview => ({
  items: ids.map((id) => ({
    applicationId: id,
    stageInstanceId: `stage-${id}`,
    applicationNumber: `APP-${id}`,
    applicantName: id,
    admissionOfferingId: 'offering-1',
    workflowStageDefinitionId: 'definition-1',
    concurrencyStamp: `fresh-${id}`,
  })),
  proposedBookings: [],
  totalCount: ids.length,
  eligibleCount: ids.length,
  availableCount: 24,
  remainingCount: 0,
  requiresRoomApproval: false,
  roomName: 'A001',
  buildingName: 'Main',
  floorName: 'Ground',
  previewFingerprint: 'preview',
  slots: [],
  warnings: [],
});

it('books only selected students with fresh stamps, never global preview suggestions', async () => {
  const preview = previewFor('Sweta', 'Nikhil', 'Other');
  preview.proposedBookings = [preview.items[2]];
  const review = reviewStudentBooking(
    [student('Sweta'), student('Nikhil')],
    sessionBookingInput(session),
    preview
  );
  expect(review.items).toHaveLength(2);
  expect(review.bookings).toEqual([
    {
      applicationId: 'Sweta',
      stageInstanceId: 'stage-Sweta',
      concurrencyStamp: 'fresh-Sweta',
      slotStartsAt: undefined,
    },
    {
      applicationId: 'Nikhil',
      stageInstanceId: 'stage-Nikhil',
      concurrencyStamp: 'fresh-Nikhil',
      slotStartsAt: undefined,
    },
  ]);
  expect(review.canConfirm).toBe(true);
});

it('keeps incompatible and no-longer-eligible students visible and blocks partial silent booking', () => {
  const wrong = { ...student('Wrong'), admissionOfferingId: 'another-offering' };
  const review = reviewStudentBooking(
    [student('Sweta'), wrong, student('Missing')],
    sessionBookingInput(session),
    previewFor('Sweta')
  );
  expect(review.items.map((item) => item.row.applicantName)).toEqual(['Sweta', 'Wrong', 'Missing']);
  expect(review.items[1].reason).toContain('different assessment');
  expect(review.items[2].reason).toContain('eligible');
  expect(review.canConfirm).toBe(false);
});

it('requires enough capacity and prevents duplicate pupil booking', () => {
  const input = sessionBookingInput(session);
  expect(
    reviewStudentBooking([student('A'), student('B')], input, {
      ...previewFor('A', 'B'),
      availableCount: 1,
    }).canConfirm
  ).toBe(false);
  expect(
    reviewStudentBooking(
      [student('A'), { ...student('B'), applicantId: 'A' }],
      input,
      previewFor('A', 'B')
    ).canConfirm
  ).toBe(false);
});

it('preserves proposed individual interview times and permits held room approval bookings', () => {
  const preview = previewFor('A', 'B');
  preview.requiresRoomApproval = true;
  preview.proposedBookings = preview.items.map((item, index) => ({
    ...item,
    slotStartsAt: `2999-10-30T0${4 + index}:30:00Z`,
  }));
  const review = reviewStudentBooking(
    [student('A'), student('B')],
    { ...sessionBookingInput(session), sessionType: 'individualInterview' },
    preview
  );
  expect(review.bookings.map((item) => item.slotStartsAt)).toEqual([
    '2999-10-30T04:30:00Z',
    '2999-10-30T05:30:00Z',
  ]);
  expect(review.canConfirm).toBe(true);
});

it('blocks interviews without a distinct proposed time for every selected student', () => {
  const preview = previewFor('A', 'B');
  const input = { ...sessionBookingInput(session), sessionType: 'individualInterview' as const };
  preview.proposedBookings = [{ ...preview.items[0], slotStartsAt: '2999-10-30T04:30:00Z' }];
  expect(
    reviewStudentBooking([student('A'), student('B')], input, preview).items[1].reason
  ).toContain('interview time');
  expect(reviewStudentBooking([student('A'), student('B')], input, preview).canConfirm).toBe(false);
  preview.proposedBookings = preview.items.map((item) => ({
    ...item,
    slotStartsAt: '2999-10-30T04:30:00Z',
  }));
  expect(reviewStudentBooking([student('A'), student('B')], input, preview).canConfirm).toBe(false);
});

it('replays the exact durable command after a lost response and clears it after definitive rejection', async () => {
  const confirm = vi
    .fn()
    .mockRejectedValueOnce(new Error('Response lost'))
    .mockResolvedValueOnce({ session, bookedCount: 1 })
    .mockRejectedValueOnce({ status: 409 });
  const retry = {};
  const command = {
    session: sessionBookingInput(session),
    previewFingerprint: 'preview',
    bookings: [{ applicationId: 'A', stageInstanceId: 'stage-A', concurrencyStamp: 'fresh-A' }],
  };
  await expect(confirmStudentBooking(command, confirm, retry)).rejects.toThrow('Response lost');
  await confirmStudentBooking(command, confirm, retry);
  expect(confirm.mock.calls[1][0]).toEqual(confirm.mock.calls[0][0]);
  await expect(confirmStudentBooking(command, confirm, retry)).rejects.toEqual({ status: 409 });
  expect(retry).not.toHaveProperty('command');
});
