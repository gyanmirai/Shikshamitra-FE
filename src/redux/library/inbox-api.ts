import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

import type { LibraryInboxItem, LibraryInboxResult } from './notification-types';

export type InboxQuery = {
  viewer: string;
  page: number;
  pageSize: number;
  unreadOnly: boolean;
  memberId?: string;
};
export const libraryInboxApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryInbox: builder.query<LibraryInboxResult, InboxQuery>({
      query: ({ viewer: _viewer, ...params }) => ({ url: '/library/inbox', params }),
      providesTags: (_result, _error, { viewer }) => [
        { type: libraryModuleType.libraryNotificationHistory, id: `Inbox:${viewer}` },
      ],
      keepUnusedDataFor: 0,
    }),
    markLibraryInboxRead: builder.mutation<LibraryInboxItem, { id: string; viewer: string }>({
      query: ({ id }) => ({ url: `/library/inbox/${encodeURIComponent(id)}/read`, method: 'POST' }),
      invalidatesTags: (_result, error, { viewer }) =>
        error
          ? []
          : [{ type: libraryModuleType.libraryNotificationHistory, id: `Inbox:${viewer}` }],
    }),
  }),
  overrideExisting: false,
});
export const { useGetLibraryInboxQuery, useMarkLibraryInboxReadMutation } = libraryInboxApi;
