import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

export const schoolWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: ({ academicMediumId }) => ({
        url: '/announcements',
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.schoolWiseAnnouncement],
    }),
    addAnnouncement: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/announcements',
        method: 'POST',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/announcements',
        method: 'PUT',
        body: data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    deleteAnnouncement: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/announcements/${id}`,
        method: 'DELETE',
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
    getAnnouncementById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/announcements/${id}`,
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: [communicationType.schoolWiseAnnouncement],
    }),
    publishAnnouncement: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/announcements/${id}/publish`,
        method: 'PUT',
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: [communicationType.schoolWiseAnnouncement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnnouncementsQuery,
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementByIdQuery,
  usePublishAnnouncementMutation,
} = schoolWiseAnnouncementApi;
