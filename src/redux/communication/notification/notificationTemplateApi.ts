import { communicationApi } from '../communicationApi';

export const notificationTemplateApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationTemplates: builder.query({
      query: ({ academicMediumId }) => ({
        url: '/notification-templates', // <-- update with your backend endpoint
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['NotificationTemplates'],
    }),
    addNotificationTemplate: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/notification-templates',
        method: 'POST',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),
    updateNotificationTemplate: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: `/notification-templates/${data.id}`,
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),
    deleteNotificationTemplate: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: `/notification-templates/${data.id}`,
        method: 'DELETE',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),
    getNotificationTemplateById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notification-templates/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['NotificationTemplates'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationTemplatesQuery,
  useAddNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useGetNotificationTemplateByIdQuery,
} = notificationTemplateApi;
