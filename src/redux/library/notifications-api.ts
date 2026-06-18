import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import {
  toLibraryPaginatedList,
  mapLibraryNotificationHistoryDto,
  mapLibraryNotificationSettingsDto,
} from './library-adapters';

export const libraryNotificationsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryNotificationSettings: builder.query({
      query: () => ({
        url: '/library/notifications/settings',
        method: 'GET',
      }),
      transformResponse: mapLibraryNotificationSettingsDto,
      providesTags: [libraryModuleType.libraryNotifications],
    }),

    updateLibraryNotificationSettings: builder.mutation({
      query: (body) => ({
        url: '/library/notifications/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: mapLibraryNotificationSettingsDto,
      invalidatesTags: [libraryModuleType.libraryNotifications],
    }),

    getLibraryNotificationHistory: builder.query({
      query: (params) => ({
        url: '/library/notifications/history',
        method: 'GET',
        params,
      }),
      transformResponse: (response) =>
        toLibraryPaginatedList(response, mapLibraryNotificationHistoryDto),
      providesTags: [libraryModuleType.libraryNotificationHistory],
    }),

    sendLibraryNotification: builder.mutation({
      query: (body) => ({
        url: '/library/notifications/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        libraryModuleType.libraryNotificationHistory,
        libraryModuleType.libraryNotifications,
      ],
    }),

    runLibraryNotificationReminders: builder.mutation({
      query: (body = {}) => ({
        url: '/library/notifications/run-reminders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        libraryModuleType.libraryNotificationHistory,
        libraryModuleType.libraryNotifications,
      ],
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
} = libraryNotificationsApi;
