import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


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
      providesTags: [communicationType.notificationTemplates],
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
      invalidatesTags: [communicationType.notificationTemplates],
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
      invalidatesTags: [communicationType.notificationTemplates],
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
      invalidatesTags: [communicationType.notificationTemplates],
    }),
    getNotificationTemplateById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/notification-templates/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.notificationTemplates],
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
