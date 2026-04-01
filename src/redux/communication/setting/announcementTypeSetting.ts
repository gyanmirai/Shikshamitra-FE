import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


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
      providesTags: [communicationType.announcementTypeOptions],
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
      invalidatesTags: [communicationType.announcementTypeOptions],
    }),
    updateAnnouncementType: builder.mutation({
      query: ({ data }) => ({
        url: `/announcement-types/${data.id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [communicationType.announcementTypeOptions],
    }),
    deleteAnnouncementType: builder.mutation({
      query: ({ data }) => ({
        url: `/announcement-types/${data.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [communicationType.announcementTypeOptions],
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
