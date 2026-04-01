import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


export const classWiseAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassWiseAnnouncements: builder.query({
      query: () => ({
        url: '/classWiseAnnouncementData',
        method: 'GET',
      }),
      providesTags: [communicationType.classWiseAnnouncement],
    }),
  }),
  overrideExisting: false,
});

export const { useGetClassWiseAnnouncementsQuery } = classWiseAnnouncementApi;
