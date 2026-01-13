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
      providesTags: ['Notifications'],
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
      invalidatesTags: ['Notifications'],
    }),
    getNotificationById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Notifications'],
    }),
    getNotificationStepOne: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-one`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Notifications'],
    }),
    getNotificationStepTwo: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-two`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Notifications'],
    }),
    getNotificationStepThree: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notifications/${id}/step-three`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['Notifications'],
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
      invalidatesTags: ['Notifications'],
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
      invalidatesTags: ['Notifications'],
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
