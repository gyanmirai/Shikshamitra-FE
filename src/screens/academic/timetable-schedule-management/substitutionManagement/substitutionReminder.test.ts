import { test, expect } from 'vitest';

import { canSendSubstitutionReminder, substitutionReminderFeedback } from './substitutionReminder';

test.each([
  ['Queued', 'info', 'Reminder queued for delivery.'],
  ['Sent', 'success', 'Reminder sent.'],
  ['Unknown', 'warning', 'Reminder delivery is unconfirmed. Check notification history.'],
  ['Failed', 'error', 'The reminder could not be sent. Check notification history.'],
  [
    'Not Sent',
    'warning',
    'No reminder was queued. Check the notification rule and the teacher’s account.',
  ],
] as const)('reports %s using the delivery result', (status, tone, message) => {
  expect(substitutionReminderFeedback(status)).toEqual({ tone, message });
});

test('only permits reminders for open duties awaiting a response', () => {
  const awaiting = {
    acknowledgementRequired: true,
    isResponseWindowOpen: true,
    status: 'Waiting Ack',
    acknowledgementStatus: 'Not Sent',
  } as const;

  expect(canSendSubstitutionReminder(awaiting)).toBe(true);
  expect(canSendSubstitutionReminder({ ...awaiting, acknowledgementStatus: 'Accepted' })).toBe(
    false
  );
  expect(canSendSubstitutionReminder({ ...awaiting, status: 'Cancelled' })).toBe(false);
  expect(canSendSubstitutionReminder({ ...awaiting, isResponseWindowOpen: false })).toBe(false);
  expect(canSendSubstitutionReminder({ ...awaiting, acknowledgementRequired: false })).toBe(false);
});
