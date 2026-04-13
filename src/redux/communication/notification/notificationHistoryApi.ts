import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

export const notificationHistoryApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationHistory: builder.query({
      query: () => ({
        url: '/notificationHistoryData', // <-- update with your backend endpoint
        method: 'GET',
      }),
      providesTags: [communicationType.notificationHistory],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationHistoryQuery } = notificationHistoryApi;
