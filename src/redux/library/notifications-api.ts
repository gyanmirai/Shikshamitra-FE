import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import {
  toLibraryPaginatedList,
  mapLibraryNotificationHistoryDto,
  mapLibraryNotificationSettingsDto,
} from './library-adapters';

import type {
  LibraryPaginatedList,
  LibraryNotificationHistory,
  LibraryNotificationSettings,
} from './library-adapters';
import type {
  NotificationSendResult,
  NotificationSendRequest,
  NotificationHistoryQuery,
  NotificationSettingsUpdate,
} from './notification-types';

const deliveryTags = [
  libraryModuleType.libraryNotificationHistory,
  libraryModuleType.libraryNotifications,
];

export const libraryNotificationsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryNotificationSettings: builder.query<LibraryNotificationSettings, void>({
      query: () => ({
        url: '/library/notifications/settings',
        method: 'GET',
      }),
      transformResponse: mapLibraryNotificationSettingsDto,
      providesTags: [libraryModuleType.libraryNotifications],
    }),

    updateLibraryNotificationSettings: builder.mutation<
      LibraryNotificationSettings,
      NotificationSettingsUpdate
    >({
      query: (body) => ({
        url: '/library/notifications/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: mapLibraryNotificationSettingsDto,
      invalidatesTags: (_result, error) => (error ? [] : deliveryTags),
    }),

    getLibraryNotificationHistory: builder.query<
      LibraryPaginatedList<LibraryNotificationHistory>,
      NotificationHistoryQuery
    >({
      query: (params) => ({
        url: '/library/notifications/history',
        method: 'GET',
        params,
      }),
      transformResponse: (response) =>
        toLibraryPaginatedList(response, mapLibraryNotificationHistoryDto),
      providesTags: [libraryModuleType.libraryNotificationHistory],
    }),

    sendLibraryNotification: builder.mutation<NotificationSendResult, NotificationSendRequest>({
      query: (body) => ({
        url: '/library/notifications/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : deliveryTags),
    }),

    runLibraryNotificationReminders: builder.mutation<
      NotificationSendResult,
      { runDate?: string } | void
    >({
      query: (body = {}) => ({
        url: '/library/notifications/run-reminders',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : deliveryTags),
    }),
    retryLibraryNotification: builder.mutation<
      LibraryNotificationHistory,
      { id: string; acknowledgePossibleDuplicate: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/library/notifications/history/${encodeURIComponent(id)}/retry`,
        method: 'POST',
        body,
      }),
      transformResponse: mapLibraryNotificationHistoryDto,
      invalidatesTags: (_result, error) => (error ? [] : deliveryTags),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryNotificationSettingsQuery,
  useUpdateLibraryNotificationSettingsMutation,
  useGetLibraryNotificationHistoryQuery,
  useSendLibraryNotificationMutation,
  useRunLibraryNotificationRemindersMutation,
  useRetryLibraryNotificationMutation,
} = libraryNotificationsApi;
