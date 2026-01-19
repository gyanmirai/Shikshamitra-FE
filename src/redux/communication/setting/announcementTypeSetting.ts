import { communicationApi } from '../communicationApi';

export const announcementTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementTypeOptions: builder.query({
      query: ({ academicMediumId }) => ({
        url: '/announcement-types',
        method: 'GET',
        params: {
          academicMediumId,
        },
      }),
      providesTags: ['AnnouncementTypeOptions'],
    }),
    addAnnouncementType: builder.mutation({
      query: ({ academicMediumId, data }) => ({
        url: '/announcement-types',
        method: 'POST',
        data,
        params: {
          academicMediumId,
        },
      }),
      invalidatesTags: ['AnnouncementTypeOptions'],
    }),
    updateAnnouncementType: builder.mutation({
      query: ({ data }) => ({
        url: `/announcement-types/${data.id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['AnnouncementTypeOptions'],
    }),
    deleteAnnouncementType: builder.mutation({
      query: ({ data }) => ({
        url: `/announcement-types/${data.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AnnouncementTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddAnnouncementTypeMutation,
  useUpdateAnnouncementTypeMutation,
  useGetAnnouncementTypeOptionsQuery,
  useDeleteAnnouncementTypeMutation,
} = announcementTypeOptionsApi;
