import { it, expect } from 'vitest';

import { isInquiryFormActivity } from './inquiry-form-history';

const event = (activityType: string, metadataJson?: string) => ({
  id: 'event-1',
  activityType,
  metadataJson,
  description: 'Saved',
  occurredAt: '2026-10-07T08:00:00Z',
});

it('shows form capture and edits while excluding contacts, notes, assignments and status-only saves', () => {
  expect(isInquiryFormActivity(event('InquiryCreated'))).toBe(true);
  expect(
    isInquiryFormActivity(
      event(
        'InquiryDetailsUpdated',
        JSON.stringify({
          After: { FormValues: [{ FieldCode: 'name', ValueJson: 'Riya' }], Status: null },
        })
      )
    )
  ).toBe(true);
  expect(
    isInquiryFormActivity(
      event('InquiryDetailsUpdated', JSON.stringify({ after: { status: 2, formValues: null } }))
    )
  ).toBe(false);
  [
    'InquiryContactRecorded',
    'InquiryFollowUpNoteRecorded',
    'InquiryStatusChanged',
    'InquiryCounsellorAssigned',
  ].forEach((type) => expect(isInquiryFormActivity(event(type))).toBe(false));
});

it('retains historical form saves even when metadata is absent or malformed', () => {
  expect(isInquiryFormActivity(event('InquiryDetailsUpdated'))).toBe(true);
  expect(isInquiryFormActivity(event('InquiryDetailsUpdated', '{legacy'))).toBe(true);
});
