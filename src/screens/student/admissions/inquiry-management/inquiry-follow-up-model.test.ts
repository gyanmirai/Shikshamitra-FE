import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import {
  inquiryReminderAt,
  inquiryFollowUpSchema,
  inquiryFollowUpReadOnlyReason,
} from './inquiry-follow-up-model';

const inquiry = { assignedCounsellorId: 'counsellor-1' } as AdmissionInquiry;
const management = {
  policy: { restrictActionsToAssignedCounsellor: true },
} as AdmissionInquiryManagement;

it.each([0, 2])('requires a future reminder for status %s', async (status) => {
  await expect(
    inquiryFollowUpSchema.validate({ note: 'Called parent', status, reminderDate: null })
  ).rejects.toThrow('Next reminder date is required');
  await expect(
    inquiryFollowUpSchema.validate({ note: 'Called parent', status, reminderDate: dayjs() })
  ).rejects.toThrow('Choose a future reminder date');
  await expect(
    inquiryFollowUpSchema.validate({
      note: 'Called parent',
      status,
      reminderDate: dayjs().add(1, 'day'),
    })
  ).resolves.toBeDefined();
});

it('accepts Not interested without a reminder and always clears its reminder payload', async () => {
  await expect(
    inquiryFollowUpSchema.validate({
      note: 'Family chose another school',
      status: 6,
      reminderDate: null,
    })
  ).resolves.toBeDefined();
  expect(
    inquiryReminderAt({ note: 'Closed', status: 6, reminderDate: dayjs().add(2, 'day') })
  ).toBeNull();
});

it('requires meaningful notes and rejects more than 500 characters', async () => {
  await expect(inquiryFollowUpSchema.validate({ note: '  ', status: 6 })).rejects.toThrow(
    'Notes are required'
  );
  await expect(
    inquiryFollowUpSchema.validate({ note: 'x'.repeat(501), status: 6 })
  ).rejects.toThrow('Use 500 characters or fewer');
});

it('serializes the selected local calendar day as an ISO instant and round-trips its date', () => {
  const selected = dayjs().add(3, 'day').hour(18).minute(35);
  const actual = inquiryReminderAt({ note: 'Call again', status: 2, reminderDate: selected });
  expect(actual).toBe(selected.startOf('day').toISOString());
  expect(actual).toMatch(/Z$/);
  expect(dayjs(actual).format('YYYY-MM-DD')).toBe(selected.format('YYYY-MM-DD'));
});

it('allows only the assigned counsellor when the intake policy restricts actions', () => {
  expect(inquiryFollowUpReadOnlyReason(inquiry, management, true, 'counsellor-1')).toBeNull();
  expect(inquiryFollowUpReadOnlyReason(inquiry, management, true, 'other-user')).toContain(
    'assigned counsellor'
  );
  expect(
    inquiryFollowUpReadOnlyReason(
      { ...inquiry, assignedCounsellorId: null },
      management,
      true,
      'counsellor-1'
    )
  ).toContain('assigned counsellor');
});

it('keeps transferred inquiry history and users without manage permission read-only', () => {
  expect(
    inquiryFollowUpReadOnlyReason(
      { ...inquiry, isTransferred: true },
      management,
      true,
      'counsellor-1'
    )
  ).toContain('read-only');
  expect(
    inquiryFollowUpReadOnlyReason(inquiry, { ...management, isLocked: true }, true, 'counsellor-1')
  ).toContain('read-only');
  expect(inquiryFollowUpReadOnlyReason(inquiry, management, false, 'counsellor-1')).toContain(
    'permission'
  );
});
