import { libraryModuleApi } from './libraryModuleApi';

import type {
  NotificationPage,
  OperationalRecipient,
  NotificationRecipient,
} from './notification-types';

export const libraryNotificationRecipientApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    searchLibraryNotificationRecipients: builder.query<
      NotificationPage<NotificationRecipient>,
      { search: string; page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/library/notifications/recipients', params }),
    }),
    searchLibraryOperationalRecipients: builder.query<OperationalRecipient[], string>({
      query: (filter) => ({
        url: '/library/notifications/settings/operational-recipients',
        params: { filter },
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useLazySearchLibraryNotificationRecipientsQuery,
  useLazySearchLibraryOperationalRecipientsQuery,
} = libraryNotificationRecipientApi;
