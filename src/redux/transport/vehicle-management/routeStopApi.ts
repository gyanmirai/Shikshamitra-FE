import { transportApi } from '../transportApi';

export const routeStopApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getRouteStopData: builder.query({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}`,
        method: 'GET',
      }),
      providesTags: ['RouteStop'],
    }),
    postRouteStopData: builder.mutation({
      query: ({ applicationId, body }: { applicationId: string; body: any }) => ({
        url: `/transport/applications/${applicationId}/assign-stop`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RouteStop'],
    }),
    statusRouteStopData: builder.mutation({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['RouteStop'],
    }),
    getSuggestedRouteData: builder.query({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}/suggested-routes`,
        method: 'GET',
      }),
      providesTags: ['RouteStop'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRouteStopDataQuery,
  usePostRouteStopDataMutation,
  useStatusRouteStopDataMutation,
  useGetSuggestedRouteDataQuery,
} = routeStopApi;
