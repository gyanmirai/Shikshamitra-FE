import { calendarModuleType } from 'src/redux/tagTypes';

import { calendarModuleApi } from '../calendarApi';

export const eventApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: `/calendar/events`,
        method: 'GET',
        params,
      }),
      providesTags: [calendarModuleType.events],
    }),

    createEvent: builder.mutation({
      query: ({ params, data }) => ({
        url: '/calendar/events',
        method: 'POST',
        data,
        params,
      }),
      invalidatesTags: [calendarModuleType.events],
    }),

    getEventById: builder.query({
      query: ({ id }) => ({
        url: `/calendar/events/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: calendarModuleType.events, id: arg.id }],
    }),

    updateEvent: builder.mutation({
      query: ({ eventId, id, body, data, ...rest }) => ({
        url: `/calendar/events/${eventId || id}`,
        method: 'PUT',
        body: body || data || rest,
      }),
      invalidatesTags: (result, error, arg) => [
        calendarModuleType.events,
        { type: calendarModuleType.events, id: arg.eventId || arg.id },
      ],
    }),

    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: `/calendar/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [calendarModuleType.events],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;
