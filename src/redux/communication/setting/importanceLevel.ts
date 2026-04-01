import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';

export const importanceLevelOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getImportanceLevelOptions: builder.query({
      query: () => ({
        url: '/importanceLevelData',
        method: 'GET',
      }),
      providesTags: [communicationType.importanceLevelOptions],
    }),
    getSentNotificationHistory: builder.query({
      query: () => ({
        url: '/sentNotificationData',
        method: 'GET',
      }),
      providesTags: [communicationType.sentNotificationHistory],
    }),
  }),
  overrideExisting: false,
});

export const { useGetImportanceLevelOptionsQuery, useGetSentNotificationHistoryQuery } =
  importanceLevelOptionsApi;
