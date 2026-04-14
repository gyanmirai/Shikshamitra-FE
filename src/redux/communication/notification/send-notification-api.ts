import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

export const sendNotificationApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ academicMediumId, search, status, page, pageSize }) => ({
        url: '/notifications',
        method: 'GET',
        params: {
          academicMediumId,
          search,
          status,
          page,
          pageSize,
        },
      }),
      providesTags: [communicationType.notifications],
    }),
    createNotificationDraft: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/notifications',
        method: 'POST',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.notifications],
    }),
    getNotificationById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.notifications],
    }),
    getNotificationStepOne: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-one`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.notifications],
    }),
    getNotificationStepTwo: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-two`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.notifications],
    }),
    getNotificationStepThree: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-three`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.notifications],
    }),
    updateNotificationChannels: builder.mutation({
      query: ({ academicMediumId, id, data }) => ({
        url: `/notifications/${id}/channels`,
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.notifications],
    }),
    composeMessageAndPublish: builder.mutation({
      query: ({ academicMediumId, id, data }) => ({
        url: `/notifications/${id}/message`,
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.notifications],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationDraftMutation,
  useGetNotificationByIdQuery,
  useGetNotificationStepOneQuery,
  useGetNotificationStepTwoQuery,
  useGetNotificationStepThreeQuery,
  useUpdateNotificationChannelsMutation,
  useComposeMessageAndPublishMutation,
} = sendNotificationApi;
