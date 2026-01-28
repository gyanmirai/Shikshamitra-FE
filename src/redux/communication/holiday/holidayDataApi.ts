import { calendarModuleApi } from 'src/redux/calendar/calendarApi';

export const holidayApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query({
      query: () => ({
        url: '/calendar/holidays',
        method: 'GET',
      }),
      providesTags: ['Holiday'],
    }),

    addHoliday: builder.mutation({
      query: (data) => ({
        url: '/calendar/holidays',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Holiday'],
    }),

    getHolidayType: builder.query({
      query: () => ({
        url: '/calendar/holiday-types',
        method: 'GET',
      }),
      providesTags: ['HolidayType'],
    }),

    addHolidayType: builder.mutation({
      query: (data) => ({
        url: '/calendar/holiday-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['HolidayType'],
    }),

    updateHoliday: builder.mutation({
      query: ({ id, body }) => ({
        url: `/calendar/holidays/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Holiday'],
    }),

    updateHolidayType: builder.mutation({
      query: ({ data, holidayTypeId }) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['HolidayType'],
    }),
    deleteHoliday: builder.mutation({
      query: (id) => ({
        url: `/calendar/holidays/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Holiday'],
    }),

    deleteHolidayType: builder.mutation({
      query: (holidayTypeId) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HolidayType'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHolidaysQuery,
  useGetHolidayTypeQuery,
  useAddHolidayMutation,
  useAddHolidayTypeMutation,
  useUpdateHolidayTypeMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayTypeMutation,
  useDeleteHolidayMutation,
} = holidayApi;
