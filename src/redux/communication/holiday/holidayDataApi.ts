import { calendarModuleApi } from 'src/redux/calendar/calendarApi';
import { communicationType, calendarModuleType } from 'src/redux/tagTypes';

export const holidayApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query({
      query: () => ({
        url: '/calendar/holidays',
        method: 'GET',
      }),
      providesTags: [communicationType.holiday],
    }),

    addHoliday: builder.mutation({
      query: ({ params, data }) => ({
        url: `/calendar/holidays`,
        method: 'POST',
        data,
        params,
      }),
      invalidatesTags: [communicationType.holiday],
    }),

    getHolidayType: builder.query({
      query: () => ({
        url: '/calendar/holiday-types',
        method: 'GET',
      }),
      providesTags: [calendarModuleType.holidayType],
    }),

    addHolidayType: builder.mutation({
      query: (data) => ({
        url: '/calendar/holiday-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: [calendarModuleType.holidayType],
    }),

    updateHoliday: builder.mutation({
      query: ({ id, body }) => ({
        url: `/calendar/holidays/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [communicationType.holiday],
    }),

    updateHolidayType: builder.mutation({
      query: ({ data, holidayTypeId }) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [calendarModuleType.holidayType],
    }),
    deleteHoliday: builder.mutation({
      query: (id) => ({
        url: `/calendar/holidays/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [communicationType.holiday],
    }),

    deleteHolidayType: builder.mutation({
      query: (holidayTypeId) => ({
        url: `/calendar/holiday-types/${holidayTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [calendarModuleType.holidayType],
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
