import { calendarModuleApi } from '../calendarApi';
import { calendarModuleType } from 'src/redux/tagTypes';


export const eventApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: `/calendar/events`,
        method: 'GET',
        parama: params,
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
      providesTags: (result, error, arg) => [{ type: calendarModuleType.events, id: arg }],
    }),

    updateEvent: builder.mutation({
      query: ({ eventId, body }) => ({
        url: `/calendar/events/${eventId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => [calendarModuleType.events, { type: calendarModuleType.events, id: arg.eventId }],
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
