import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type RouteListQuery = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: number | string;
  academicMediumId?: string;
};

type RouteStopsQuery = {
  routeId?: string;
  page?: number;
  academicMediumId?: string;
};

export const buildRouteListRequest = (params?: RouteListQuery | void) => {
  const { pageNumber = 1, pageSize = 10, search, status, academicMediumId } = params ?? {};

  return {
    url: '/transport/routes',
    method: 'GET',
    params: { pageNumber, pageSize, search, status, academicMediumId },
  };
};

export const buildRouteStopsRequest = (params?: RouteStopsQuery | void) => {
  const { routeId, page = 1, academicMediumId } = params ?? {};

  return {
    url: `/transport/routes/${routeId}/stops`,
    method: 'GET',
    params: { page, academicMediumId },
  };
};

export const normalizeRouteListResponse = (response: any) => {
  const payload = response?.data ?? response;
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

const unwrapResult = (response: any) => response?.data ?? response;

const normalizePagedItems = (response: any) => {
  const payload = unwrapResult(response);
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

export const routeManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get routes (Paginated)
    getRoutes: builder.query<any, RouteListQuery | void>({
      query: buildRouteListRequest,
      transformResponse: normalizeRouteListResponse,
      providesTags: [transportType.routeManagement],
    }),

    // Create route (Step 1)
    createRoute: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/routes',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [transportType.routeManagement],
    }),

    // Get route by ID (Full details)
    getRouteById: builder.query({
      query: ({ routeId, academicMediumId }) => ({
        url: `/transport/routes/${routeId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: routeId },
      ],
    }),

    // Update route (Step 1)
    updateRoute: builder.mutation({
      query: ({ routeId, body, academicMediumId }) => ({
        url: `/transport/routes/${routeId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: routeId },
        transportType.routeManagement,
      ],
    }),

    // Get route stops (Step 2)
    getRouteStops: builder.query<any, RouteStopsQuery | void>({
      query: buildRouteStopsRequest,
      transformResponse: (response: any) => response?.data ?? response ?? [],
      providesTags: (result, error, params) => [
        { type: transportType.routeManagement, id: `${params?.routeId}-stops` },
      ],
    }),

    // Assign stops to route
    assignStopsToRoute: builder.mutation({
      query: ({ routeId, stops, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/stops`,
        method: 'POST',
        params: { academicMediumId },
        body: { stops },
      }),
      transformResponse: (response: any) => response?.data ?? response ?? [],
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-stops` },
        { type: transportType.routeManagement, id: routeId },
      ],
    }),

    // Get vehicle assignment (Step 3)
    getVehicleAssignment: builder.query({
      query: ({ routeId, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/vehicle-assignment`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-vehicle` },
      ],
    }),

    // Assign vehicle, driver and conductor
    assignVehicleToRoute: builder.mutation({
      query: ({ routeId, body, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/vehicle-assignment`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-vehicle` },
        { type: transportType.routeManagement, id: routeId },
        transportType.vehicleManagement,
        transportType.driverConductorData,
      ],
    }),

    deleteVehicleAssignment: builder.mutation({
      query: ({ routeId, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/vehicle-assignment`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-vehicle` },
        { type: transportType.routeManagement, id: routeId },
        transportType.vehicleManagement,
        transportType.driverConductorData,
      ],
    }),

    // Get vehicle history for a route
    getRouteVehicleHistory: builder.query({
      query: ({ routeId, academicMediumId, ...params }) => ({
        url: `/transport/routes/${routeId}/vehicle-history`,
        method: 'GET',
        params: { ...params, academicMediumId },
      }),
      transformResponse: normalizePagedItems,
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-vehicle-history` },
      ],
    }),

    // Get driver/conductor history for a route
    getRouteDriverConductorHistory: builder.query({
      query: ({ routeId, academicMediumId, ...params }) => ({
        url: `/transport/routes/${routeId}/driver-conductor-history`,
        method: 'GET',
        params: { ...params, academicMediumId },
      }),
      transformResponse: normalizePagedItems,
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-staff-history` },
      ],
    }),

    changeRouteStatus: builder.mutation({
      query: ({ routeId, body, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: routeId },
        transportType.routeManagement,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useGetRouteByIdQuery,
  useUpdateRouteMutation,
  useGetRouteStopsQuery,
  useAssignStopsToRouteMutation,
  useGetVehicleAssignmentQuery,
  useAssignVehicleToRouteMutation,
  useDeleteVehicleAssignmentMutation,
  useGetRouteVehicleHistoryQuery,
  useGetRouteDriverConductorHistoryQuery,
  useChangeRouteStatusMutation,
} = routeManagementApi;
