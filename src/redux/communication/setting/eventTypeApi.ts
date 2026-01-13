import { communicationApi } from '../communicationApi';

export const eventTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventTypeOptions: builder.query({
      query: () => ({
        url: '/calendar/event-types',
        method: 'GET',
      }),
      providesTags: ['EventTypeOptions'],
    }),

    addEventType: builder.mutation({
      query: (body) => ({
        url: '/calendar/event-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EventTypeOptions'],
    }),

    updateEventType: builder.mutation({
      query: ({ body, eventTypeId }) => ({
        url: `/calendar/event-types/${eventTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EventTypeOptions'],
    }),

    deleteEventType: builder.mutation({
      query: (eventTypeId) => ({
        url: `/calendar/event-types/${eventTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EventTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventTypeOptionsQuery,
  useAddEventTypeMutation,
  useUpdateEventTypeMutation,
  useDeleteEventTypeMutation,
} = eventTypeOptionsApi;
