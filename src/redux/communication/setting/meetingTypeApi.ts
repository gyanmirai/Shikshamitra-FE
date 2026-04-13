import { api } from 'src/redux/service';
import { meetingTypeOptionsType } from 'src/redux/tagTypes';

export const meetingTypeOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMeetingTypeOptions: builder.query({
      query: () => ({
        url: '/meetingTypeData',
        method: 'GET',
      }),
      providesTags: [meetingTypeOptionsType.meetingTypeOptions],
    }),
  }),
});

export const { useGetMeetingTypeOptionsQuery } = meetingTypeOptionsApi;
