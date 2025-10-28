import { communicationApi } from '../communicationApi';

export const importanceLevelOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getImportanceLevelOptions: builder.query({
      query: () => ({
        url: '/importanceLevelData',
        method: 'GET',
      }),
      providesTags: ['ImportanceLevelOptions'],
    }),
    getSentNotificationHistory: builder.query({
      query: () => ({
        url: '/sentNotificationData',
        method: 'GET',
      }),
      providesTags: ['SentNotificationHistory'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetImportanceLevelOptionsQuery, useGetSentNotificationHistoryQuery } =
  importanceLevelOptionsApi;
