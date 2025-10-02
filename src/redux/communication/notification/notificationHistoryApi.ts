import { communicationApi } from '../communicationApi';

export const notificationHistoryApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationHistory: builder.query({
      query: () => ({
        url: '/notificationHistoryData', // <-- update with your backend endpoint
        method: 'GET',
      }),
      providesTags: ['NotificationHistory'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationHistoryQuery } = notificationHistoryApi;
