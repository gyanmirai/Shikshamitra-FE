import { api } from 'src/redux/service';
import { eventHolidayType } from 'src/redux/tagTypes';

export const EventHolidayApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEventHoliday: builder.query({
      query: () => ({ url: '/app/event-and-holiday' }),
      providesTags: [eventHolidayType.eventHoliday],
    }),
    getEventHolidayByDate: builder.query({
      query: (date) => ({ url: `/app/event-and-holiday/event-and-holiday-by-month?date=${date}` }),
      providesTags: [eventHolidayType.eventHoliday],
    }),
    addEventHoliday: builder.mutation({
      query: (body) => ({
        url: '/app/event-and-holiday',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [eventHolidayType.eventHoliday],
    }),
    updateEventHoliday: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/event-and-holiday/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [eventHolidayType.eventHoliday],
    }),
    deleteEventHoliday: builder.mutation({
      query: (id) => ({
        url: `/app/event-and-holiday/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [eventHolidayType.eventHoliday],
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
