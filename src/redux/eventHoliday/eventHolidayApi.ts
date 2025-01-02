import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const EventHolidayApi = createApi({
  reducerPath: 'EventHolidayApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['EventHoliday'],
  endpoints: (builder) => ({
    getEventHoliday: builder.query({
      query: () => ({ url: '/app/event-and-holiday' }),
      providesTags: ['EventHoliday'],
    }),
    getEventHolidayByDate: builder.query({
      query: (date) => ({ url: `/app/event-and-holiday/event-and-holiday-by-month?date=${date}` }),
      providesTags: ['EventHoliday'],
    }),
    addEventHoliday: builder.mutation({
      query: (body) => ({
        url: '/app/event-and-holiday',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['EventHoliday'],
    }),
    updateEventHoliday: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/event-and-holiday/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['EventHoliday'],
    }),
    deleteEventHoliday: builder.mutation({
      query: (id) => ({
        url: `/app/event-and-holiday/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EventHoliday'],
    }),
  }),
});

export const {
  useAddEventHolidayMutation,
  useDeleteEventHolidayMutation,
  useGetEventHolidayQuery,
  useUpdateEventHolidayMutation,
  useGetEventHolidayByDateQuery,
  useLazyGetEventHolidayQuery,
  useLazyGetEventHolidayByDateQuery,
} = EventHolidayApi;
