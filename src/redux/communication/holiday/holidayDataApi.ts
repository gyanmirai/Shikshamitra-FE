import { communicationApi } from '../communicationApi';

export const holidayApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query({
      query: () => ({
        url: '/holidayData',
        method: 'GET',
      }),
      providesTags: ['Holiday'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetHolidaysQuery } = holidayApi;
