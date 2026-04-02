import { calendarModuleType } from 'src/redux/tagTypes';

import { calendarModuleApi } from '../calendarApi';

export const eventTypeOptionsApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventTypeOptions: builder.query({
      query: () => ({
        url: '/calendar/event-types',
        method: 'GET',
      }),
      providesTags: [calendarModuleType.eventTypeOptions],
    }),

    addEventType: builder.mutation({
      query: (body) => ({
        url: '/calendar/event-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: [calendarModuleType.eventTypeOptions],
    }),

    updateEventType: builder.mutation({
      query: ({ body, eventTypeId }) => ({
        url: `/calendar/event-types/${eventTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [calendarModuleType.eventTypeOptions],
    }),

    deleteEventType: builder.mutation({
      query: (eventTypeId) => ({
        url: `/calendar/event-types/${eventTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [calendarModuleType.eventTypeOptions],
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
