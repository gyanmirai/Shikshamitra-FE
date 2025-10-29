import { transportApi } from '../transportApi';

export const routeStopApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getRouteStopData: builder.query({
      query: () => ({
        url: '/routeStopData',
        method: 'GET',
      }),
      providesTags: ['RouteStop'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRouteStopDataQuery } = routeStopApi;
