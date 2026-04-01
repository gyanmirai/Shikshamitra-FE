import { transportApi } from '../transportApi';
import { transportType } from 'src/redux/tagTypes';


export const routeStopApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getRouteStopData: builder.query({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}`,
        method: 'GET',
      }),
      providesTags: [transportType.routeStop],
    }),
    postRouteStopData: builder.mutation({
      query: ({ applicationId, body }: { applicationId: string; body: any }) => ({
        url: `/transport/applications/${applicationId}/assign-stop`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.routeStop],
    }),
    statusRouteStopData: builder.mutation({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [transportType.routeStop],
    }),
    getSuggestedRouteData: builder.query({
      query: (applicationId: string) => ({
        url: `/transport/applications/${applicationId}/suggested-routes`,
        method: 'GET',
      }),
      providesTags: [transportType.routeStop],
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
