import { communicationApi } from '../communicationApi';

export const notificationTemplateApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationTemplates: builder.query({
      query: () => ({
        url: '/notificationTemplateData', // <-- update with your backend endpoint
        method: 'GET',
      }),
      providesTags: ['NotificationTemplates'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationTemplatesQuery } = notificationTemplateApi;
