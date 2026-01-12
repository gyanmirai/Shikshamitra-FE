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

    addHolidayType: builder.mutation({
      query: (data) => ({
        url: '/api/calendar/holiday-types',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Holiday'],
    }),

    updateHolidayType: builder.mutation({
      query: ({ data, holidayTypeId }) => ({
        url: `/api/calendar/holiday-types/${holidayTypeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Holiday'],
    }),

    deleteHolidayType: builder.mutation({
      query: (holidayTypeId) => ({
        url: `/api/calendar/holiday-types/${holidayTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Holiday'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHolidaysQuery,
  useAddHolidayTypeMutation,
  useUpdateHolidayTypeMutation,
  useDeleteHolidayTypeMutation,
} = holidayApi;
