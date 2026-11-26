import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import dayjs from 'dayjs';
import { fDate } from 'src/utils/format-time';

import { notificationLink } from './notification-link';

const defaultLessonPlanTitles: Readonly<Record<string, string>> = {
  'LessonPlan: Submitted': 'Lesson plan submitted',
  'LessonPlan: Approved': 'Lesson plan approved',
  'LessonPlan: Changes Requested': 'Changes requested',
  'LessonPlan: Rejected': 'Lesson plan rejected',
};

export function notificationDay(creationTime: string, now: dayjs.Dayjs) {
  const date = dayjs(creationTime);
  if (!date.isValid()) return 'Earlier';
  if (date.isSame(now, 'day')) return 'Today';
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  return fDate(date) ?? 'Earlier';
}

export function needsNotificationAttention(item: NotificationInboxItem) {
  return item.requiresReview === true || (item.requiresAcknowledgement === true && !item.acknowledgedAt);
}

export function presentNotification(item: NotificationInboxItem) {
  const originalTitle = item.title.trim();
  const lessonPlanTitle = Object.hasOwn(defaultLessonPlanTitles, originalTitle)
    ? defaultLessonPlanTitles[originalTitle]
    : undefined;
  const link = notificationLink(item.relativeLink);
  const body = item.body.trim();
  const envelope = /^Hello [^\r\n]+,\r?\n([\s\S]+)\r?\nView details: (\S+)\r?\n[^\r\n]+$/.exec(body);
  let message = body;
  if (envelope && link) {
    try {
      const target = new URL(envelope[2], 'https://notifications.invalid');
      if (`${target.pathname}${target.search}${target.hash}` === link) message = envelope[1].trim();
    } catch {
      // Keep the stored message when the generated envelope cannot be verified.
    }
  }
  return {
    title: lessonPlanTitle ?? (originalTitle || 'School notification'),
    message,
    isLessonPlan: Boolean(lessonPlanTitle || item.requiresReview),
    link: link === '/dashboard?openNotifications=1' ? null : link,
  };
}
