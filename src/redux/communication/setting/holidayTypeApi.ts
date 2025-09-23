import { communicationApi } from '../communicationApi';

export const holidayTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidayTypeOptions: builder.query({
      query: () => ({
        url: '/holidayTypeData',
        method: 'GET',
      }),
      providesTags: ['HolidayTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetHolidayTypeOptionsQuery } = holidayTypeOptionsApi;
