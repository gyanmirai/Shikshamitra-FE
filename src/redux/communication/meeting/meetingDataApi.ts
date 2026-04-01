import { communicationApi } from '../communicationApi';
import { communicationType } from 'src/redux/tagTypes';


export const meetingApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetingDetails: builder.query({
      query: () => ({
        url: '/meetingData',
        method: 'GET',
      }),
      providesTags: [communicationType.meetingDetails],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMeetingDetailsQuery } = meetingApi;
