import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

const unwrapResult = (response: any) => response?.data ?? response;

const normalizeSuggestedRoutes = (response: any) => {
  const payload = unwrapResult(response) ?? [];
  return payload.map((route: any) => ({
    ...route,
    routeId: route.routeId ?? route.id,
    routeName: route.routeName ?? route.name,
    students: route.occupiedSeats ?? route.students ?? 0,
    capacity: route.capacity ?? 0,
    status: route.status ?? 'Active',
    stops: (route.stops ?? []).map((stop: any) => ({
      ...stop,
      routeStopId: stop.id,
      id: stop.stopId ?? stop.id,
      stopId: stop.stopId ?? stop.id,
      stopName: stop.stopName ?? stop.name,
      arrivalTime: stop.expectedArrivalTime ?? stop.arrivalTime,
      departureTime: stop.expectedDepartureTime ?? stop.departureTime,
    })),
  }));
};

export const buildRouteStopDetailRequest = ({
  applicationId,
  academicMediumId,
}: {
  applicationId?: string;
  academicMediumId?: string;
}) => ({
  url: `/transport/applications/${applicationId}`,
  method: 'GET',
  params: { academicMediumId },
});

export const buildRouteStopAssignRequest = ({
  applicationId,
  body,
  academicMediumId,
}: {
  applicationId: string;
  body: any;
  academicMediumId?: string;
}) => ({
  url: `/transport/applications/${applicationId}/route-stop`,
  method: 'PUT',
  params: { academicMediumId },
  body,
});

export const buildApplicationStatusRequest = ({
  applicationId,
  body,
  academicMediumId,
}: {
  applicationId: string;
  body: any;
  academicMediumId?: string;
}) => ({
  url: `/transport/applications/${applicationId}/status`,
  method: 'PUT',
  params: { academicMediumId },
  body,
});

export const buildSuggestedRoutesRequest = ({
  applicationId,
  academicMediumId,
}: {
  applicationId?: string;
  academicMediumId?: string;
}) => ({
  url: `/transport/applications/${applicationId}/suggested-routes`,
  method: 'GET',
  params: { academicMediumId },
});

export const routeStopApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getRouteStopData: builder.query({
      query: buildRouteStopDetailRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.routeStop],
    }),
    postRouteStopData: builder.mutation({
      query: buildRouteStopAssignRequest,
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.routeStop, transportType.member],
    }),
    statusRouteStopData: builder.mutation({
      query: buildApplicationStatusRequest,
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.routeStop, transportType.member],
    }),
    getSuggestedRouteData: builder.query({
      query: buildSuggestedRoutesRequest,
      transformResponse: normalizeSuggestedRoutes,
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
