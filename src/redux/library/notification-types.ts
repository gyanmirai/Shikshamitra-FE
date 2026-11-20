import type { LibraryNotificationHistory, LibraryNotificationSetting } from './library-adapters';

export type NotificationPage<T> = {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};
export type NotificationHistoryQuery = {
  eventType?: string;
  eventGroup?: string;
  channel?: string;
  status?: string;
  page: number;
  pageSize: number;
};
export type NotificationSettingsUpdate = {
  automaticReminderTimeLocal?: string;
  studentInboxRouting?: string;
  operationalRecipientUserIds?: string[];
  items?: (Partial<LibraryNotificationSetting> & { id: string })[];
};
export type NotificationSendRequest = {
  eventType: string;
  channel: string;
  subject?: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  recipients: {
    memberId?: string;
    recipientRole?: string;
    recipientName?: string;
    recipientEmail?: string;
  }[];
};
export type NotificationSendResult = {
  attempted: number;
  queued: number;
  sent: number;
  skipped: number;
  failed: number;
  items: LibraryNotificationHistory[];
  runDate?: string;
};
export type NotificationRecipient = {
  id: string;
  memberIdentifier?: string | null;
  memberName: string;
  role: 0 | 1;
  isActiveMembership: boolean;
  hasRecoverableObligation: boolean;
  isEligibleForNotification: boolean;
  eligibilityReason?: string | null;
};
export type OperationalRecipient = {
  userId: string;
  userName: string;
  displayName: string;
  email: string;
};
export type LibraryInboxItem = {
  id: string;
  eventType: string;
  subject: string;
  message: string;
  memberId?: string | null;
  memberName?: string | null;
  sentAt: string;
  readAt?: string | null;
};
export type LibraryInboxResult = NotificationPage<LibraryInboxItem> & { unreadCount: number };
