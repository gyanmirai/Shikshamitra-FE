import { communicationApi } from '../communicationApi';

export const announcementTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementTypeOptions: builder.query({
      query: () => ({
        url: '/announcementTypeData',
        method: 'GET',
      }),
      providesTags: ['AnnouncementTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAnnouncementTypeOptionsQuery } = announcementTypeOptionsApi;
