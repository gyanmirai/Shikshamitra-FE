import { communicationApi } from '../communicationApi';

export const meetingApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetingDetails: builder.query({
      query: () => ({
        url: '/meetingData',
        method: 'GET',
      }),
      providesTags: ['MeetingDetails'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMeetingDetailsQuery } = meetingApi;
