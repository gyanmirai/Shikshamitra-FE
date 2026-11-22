import type { SubstitutionRow } from './substitutionData';

export function canSendSubstitutionReminder(
  duty: Pick<
    SubstitutionRow,
    'acknowledgementRequired' | 'isResponseWindowOpen' | 'status' | 'acknowledgementStatus'
  >
) {
  return (
    duty.acknowledgementRequired &&
    duty.isResponseWindowOpen &&
    (duty.status === 'Assigned' || duty.status === 'Waiting Ack') &&
    (duty.acknowledgementStatus === 'Not Sent' || duty.acknowledgementStatus === 'Sent')
  );
}

export function substitutionReminderFeedback(status: string): {
  tone: 'info' | 'warning' | 'error' | 'success';
  message: string;
} {
  switch (status) {
    case 'Queued':
      return { tone: 'info', message: 'Reminder queued for delivery.' };
    case 'Sent':
      return { tone: 'success', message: 'Reminder sent.' };
    case 'Unknown':
      return {
        tone: 'warning',
        message: 'Reminder delivery is unconfirmed. Check notification history.',
      };
    case 'Failed':
      return {
        tone: 'error',
        message: 'The reminder could not be sent. Check notification history.',
      };
    default:
      return {
        tone: 'warning',
        message: 'No reminder was queued. Check the notification rule and the teacher’s account.',
      };
  }
}
