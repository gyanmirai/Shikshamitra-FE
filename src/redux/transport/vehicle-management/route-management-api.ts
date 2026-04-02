import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export const routeManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get routes (Paginated)
    getRoutes: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, academicMediumId }) => ({
        url: '/transport/routes',
        method: 'GET',
        params: { pageNumber, pageSize, academicMediumId },
      }),
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
    getRouteStops: builder.query({
      query: ({ routeId, page = 1, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/stops`,
        method: 'GET',
        params: { page, academicMediumId },
      }),
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-stops` },
      ],
    }),

    // Assign stops to route
    assignStopsToRoute: builder.mutation({
      query: ({ routeId, stops, academicMediumId }) => ({
        url: `/transport/routes/${routeId}/stops`,
        method: 'POST',
        params: { academicMediumId },
        data: { stops },
      }),
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
      invalidatesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-vehicle` },
        { type: transportType.routeManagement, id: routeId },
      ],
    }),

    // Get vehicle history for a route
    getRouteVehicleHistory: builder.query({
      query: ({ routeId, academicMediumId, ...params }) => ({
        url: `/transport/routes/${routeId}/vehicle-history`,
        method: 'GET',
        params: { ...params, academicMediumId },
      }),
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
      providesTags: (result, error, { routeId }) => [
        { type: transportType.routeManagement, id: `${routeId}-staff-history` },
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
  useGetRouteVehicleHistoryQuery,
  useGetRouteDriverConductorHistoryQuery,
} = routeManagementApi;
