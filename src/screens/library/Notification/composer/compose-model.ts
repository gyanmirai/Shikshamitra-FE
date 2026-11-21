import type { NotificationRecipient } from 'src/redux/library/notification-types';

import * as Yup from 'yup';

export type ComposeValues = {
  eventType: string;
  channel: string;
  subject: string;
  message: string;
  recipients: NotificationRecipient[];
};
const tokens = new Set(['memberName', 'recipientName', 'recipientEmail']);
const supportedTokens = (text?: string) =>
  [...(text || '').matchAll(/\{\{([\s\S]*?)\}\}/g)].every((match) => tokens.has(match[1].trim()));
export const composeSchema = Yup.object({
  eventType: Yup.string().required('Choose an event'),
  channel: Yup.string().required('Choose a channel'),
  subject: Yup.string()
    .trim()
    .required('Enter a subject')
    .max(300, 'Use at most 300 characters')
    .test(
      'tokens',
      'Use only memberName, recipientName or recipientEmail double-brace variables.',
      supportedTokens
    ),
  message: Yup.string()
    .trim()
    .required('Enter a message')
    .max(2000, 'Use at most 2000 characters')
    .test(
      'tokens',
      'Use only memberName, recipientName or recipientEmail double-brace variables.',
      supportedTokens
    ),
  recipients: Yup.array()
    .min(1, 'Select at least one member')
    .test(
      'eligible',
      'Review the selected members. Some are no longer eligible notification candidates.',
      (items) => items?.every((item) => item.isEligibleForNotification) ?? false
    ),
});
