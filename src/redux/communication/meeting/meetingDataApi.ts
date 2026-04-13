import { communicationType } from 'src/redux/tagTypes';

import { communicationApi } from '../communicationApi';

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
