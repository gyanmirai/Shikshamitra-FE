import { communicationApi } from '../communicationApi';

export const eventTypeOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventTypeOptions: builder.query({
      query: () => ({
        url: '/eventTypeData',
        method: 'GET',
      }),
      providesTags: ['EventTypeOptions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEventTypeOptionsQuery } = eventTypeOptionsApi;
