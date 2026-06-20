import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

export const notificationTemplateApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationTemplates: builder.query({
      query: (params = {}) => ({
        url: '/notification-templates',
        method: 'GET',
        params,
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
      query: ({ academicMediumId, id, data }) => ({
        url: `/notification-templates/${id}`,
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.notificationTemplates],
    }),
    deleteNotificationTemplate: builder.mutation({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id || arg?.data?.id;
        return {
          url: `/notification-templates/${id}`,
          method: 'DELETE',
          params: {
            academicMediumId: typeof arg === 'string' ? undefined : arg?.academicMediumId,
          },
        };
      },
      invalidatesTags: [communicationType.notificationTemplates],
    }),
    getCommunicationTemplates: builder.query({
      query: (params = {}) => ({
        url: '/communication/templates',
        method: 'GET',
        params,
      }),
      providesTags: [communicationType.notificationTemplates],
    }),
    addCommunicationTemplate: builder.mutation({
      query: (data) => ({
        url: '/communication/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [communicationType.notificationTemplates],
    }),
    updateCommunicationTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/communication/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [communicationType.notificationTemplates],
    }),
    deleteCommunicationTemplate: builder.mutation({
      query: (id) => ({
        url: `/communication/templates/${id}`,
        method: 'DELETE',
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
  useGetCommunicationTemplatesQuery,
  useAddCommunicationTemplateMutation,
  useUpdateCommunicationTemplateMutation,
  useDeleteCommunicationTemplateMutation,
} = notificationTemplateApi;
