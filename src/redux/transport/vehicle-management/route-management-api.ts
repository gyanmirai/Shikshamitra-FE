import { transportApi } from '../transportApi';

export const routeManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableRoutes: builder.query({
      query: () => ({
        url: '/routeAssignedStudentData',
        method: 'GET',
      }),
      providesTags: ['RouteAssignedStudentData'],
    }),
    getRouteStopsData: builder.query({
      query: () => ({
        url: '/routeStopsData',
        method: 'GET',
      }),
      providesTags: ['RouteStopsData'],
    }),
    getVehicleHistory: builder.query({
      query: () => ({
        url: '/vehicleHistoryData',
        method: 'GET',
      }),
      providesTags: ['VehicleHistory'],
    }),
    getDriverConductorHistory: builder.query({
      query: () => ({
        url: '/driverConductorHistoryData',
        method: 'GET',
      }),
      providesTags: ['DriverConductorHistory'],
    }),
    getAvailableVehicles: builder.query({
      query: () => ({
        url: '/availableVehiclesData',
        method: 'GET',
      }),
      providesTags: ['AvailableVehicles'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAvailableRoutesQuery,
  useGetRouteStopsDataQuery,
  useGetDriverConductorHistoryQuery,
  useGetVehicleHistoryQuery,
  useGetAvailableVehiclesQuery,
} = routeManagementApi;
