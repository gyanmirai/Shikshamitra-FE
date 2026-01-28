import { calendarModuleApi } from '../calendarApi';

export const eventApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: `/calendar/events`,
        method: 'GET',
        parama: params,
      }),
      providesTags: ['Events'],
    }),

    createEvent: builder.mutation({
      query: (body) => ({
        url: '/calendar/events',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Events'],
    }),

    getEventById: builder.query({
      query: ({ id }) => ({
        url: `/calendar/events/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Events', id: arg }],
    }),

    updateEvent: builder.mutation({
      query: ({ eventId, body }) => ({
        url: `/calendar/events/${eventId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => ['Events', { type: 'Events', id: arg.eventId }],
    }),

    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: `/calendar/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
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
