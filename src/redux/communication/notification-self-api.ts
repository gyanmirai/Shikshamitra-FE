import { api } from '../service';

import type { PagedResultDto } from './communicationTypes';
import type { AcademicNotificationChannel } from '../academic-notifications/types';

export interface NotificationInboxItem {
  id: string;
  title: string;
  body: string;
  relativeLink: string | null;
  creationTime: string;
  readAt: string | null;
  acknowledgedAt: string | null;
}

export interface NotificationPreference {
  category: string;
  studentId: string | null;
  enabledChannels: AcademicNotificationChannel[];
  languageCode: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  concurrencyStamp?: string;
}

type InboxQuery = { owner: string; unreadOnly: boolean; skipCount: number; maxResultCount: number };
type InboxCommand = { owner: string; id: string; action: 'read' | 'acknowledge' };

const root = '/communication/notifications/me';
const inboxTag = 'PersonalNotificationInbox' as const;
const preferencesTag = 'PersonalNotificationPreferences' as const;

export const notificationSelfApi = api.enhanceEndpoints({ addTagTypes: [inboxTag, preferencesTag] }).injectEndpoints({
  endpoints: (builder) => ({
    personalNotificationInbox: builder.query<PagedResultDto<NotificationInboxItem>, InboxQuery>({
      query: ({ owner, ...params }) => ({ url: `${root}/inbox`, params, cache: 'no-store', expectedSessionOwner: owner }),
      providesTags: (_, __, { owner }) => [{ type: inboxTag, id: owner }],
      keepUnusedDataFor: 0,
    }),
    personalNotificationUnreadCount: builder.query<{ unreadCount: number }, string>({
      query: (owner) => ({ url: `${root}/unread-count`, cache: 'no-store', expectedSessionOwner: owner }),
      providesTags: (_, __, owner) => [{ type: inboxTag, id: owner }],
      keepUnusedDataFor: 0,
    }),
    changePersonalNotificationItem: builder.mutation<NotificationInboxItem, InboxCommand>({
      query: ({ owner, id, action }) => ({
        url: `${root}/inbox/${encodeURIComponent(id)}/${action}`, method: 'POST', expectedSessionOwner: owner,
      }),
      invalidatesTags: (_, error, { owner }) =>
        !error || error.status === 403 || error.status === 404 ? [{ type: inboxTag, id: owner }] : [],
    }),
    personalNotificationPreferences: builder.query<NotificationPreference[], string>({
      query: (owner) => ({ url: `${root}/preferences`, cache: 'no-store', expectedSessionOwner: owner }),
      providesTags: (_, __, owner) => [{ type: preferencesTag, id: owner }],
      keepUnusedDataFor: 0,
    }),
    savePersonalNotificationPreference: builder.mutation<NotificationPreference, { owner: string; input: NotificationPreference }>({
      query: ({ owner, input }) => ({
        url: `${root}/preferences`, method: 'PUT', body: input, expectedSessionOwner: owner,
      }),
      invalidatesTags: (_, error, { owner }) => !error ? [{ type: preferencesTag, id: owner }] : [],
    }),
  }),
});

export const {
  usePersonalNotificationInboxQuery,
  usePersonalNotificationUnreadCountQuery,
  useChangePersonalNotificationItemMutation,
  usePersonalNotificationPreferencesQuery,
  useSavePersonalNotificationPreferenceMutation,
} = notificationSelfApi;
