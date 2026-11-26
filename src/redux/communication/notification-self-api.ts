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
  requiresReview?: boolean;
  requiresAcknowledgement?: boolean;
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

export interface NotificationPreferenceOptions {
  categories: { category: string; channels: AcademicNotificationChannel[] }[];
  students: { studentId: string; displayName: string }[];
}

type InboxQuery = { owner: string; unreadOnly: boolean };
type InboxCommand = { owner: string; id: string; action: 'read' | 'acknowledge' };

const root = '/communication/notifications/me';
const inboxTag = 'PersonalNotificationInbox' as const;
const preferencesTag = 'PersonalNotificationPreferences' as const;
const inboxPageSize = 10;

export const notificationSelfApi = api.enhanceEndpoints({ addTagTypes: [inboxTag, preferencesTag] }).injectEndpoints({
  endpoints: (builder) => ({
    personalNotificationInbox: builder.infiniteQuery<PagedResultDto<NotificationInboxItem>, InboxQuery, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (page, _, offset) => {
          const nextOffset = offset + page.items.length;
          return page.items.length && nextOffset < page.totalCount ? nextOffset : undefined;
        },
      },
      query: ({ queryArg: { owner, unreadOnly }, pageParam }) => ({
        url: `${root}/inbox`,
        params: { unreadOnly, skipCount: pageParam, maxResultCount: inboxPageSize, prioritizeActions: true },
        cache: 'no-store',
        expectedSessionOwner: owner,
      }),
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
    personalNotificationPreferenceOptions: builder.query<NotificationPreferenceOptions, string>({
      query: (owner) => ({ url: `${root}/preferences/options`, cache: 'no-store', expectedSessionOwner: owner }),
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
  usePersonalNotificationInboxInfiniteQuery,
  usePersonalNotificationUnreadCountQuery,
  useChangePersonalNotificationItemMutation,
  usePersonalNotificationPreferencesQuery,
  usePersonalNotificationPreferenceOptionsQuery,
  useSavePersonalNotificationPreferenceMutation,
} = notificationSelfApi;
