import { communicationApi } from '../communicationApi';

export const eventAnnouncementApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventAnnouncements: builder.query({
      query: () => ({
        url: '/eventData',
        method: 'GET',
      }),
      providesTags: ['EventAnnouncement'],
    }),

    addEventAnnouncement: builder.mutation({
      query: (body: any) => ({
        url: '/calendar/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EventAnnouncement'],
    }),

    updateEventAnnouncement: builder.mutation({
      query: ({ body, eventId }: { body: any; eventId: string }) => ({
        url: `/calendar/events/${eventId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EventAnnouncement'],
    }),

    deleteEventAnnouncement: builder.mutation({
      query: (eventId: string) => ({
        url: `/calendar/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EventAnnouncement'],
    }),

    getEventAnnouncementById: builder.query({
      query: (eventId: string) => ({
        url: `/calendar/events/${eventId}`,
        method: 'GET',
      }),
      providesTags: ['EventAnnouncement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEventAnnouncementsQuery } = eventAnnouncementApi;
