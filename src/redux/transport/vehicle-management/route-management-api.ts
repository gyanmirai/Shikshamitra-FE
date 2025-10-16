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
      providesTags: ['VehicleHistoryData'],
    }),
    getDriverConductorHistory: builder.query({
      query: () => ({
        url: '/driverConductorHistoryData',
        method: 'GET',
      }),
      providesTags: ['DriverConductorHistoryData'],
    }),
    getAvailableVehicles: builder.query({
      query: () => ({
        url: '/availableVehiclesData',
        method: 'GET',
      }),
      providesTags: ['AvailableVehicles'],
    }),
    getAssignableVehicles: builder.query({
      query: () => ({
        url: '/assignableVehiclesData',
        method: 'GET',
      }),
      providesTags: ['AssignableVehicles'],
    }),
    getSelectableDrivers: builder.query({
      query: () => ({
        url: '/selectableDriversData',
        method: 'GET',
      }),
      providesTags: ['SelectableDrivers'],
    }),
    getSelectableConductors: builder.query({
      query: () => ({
        url: '/selectableConductorsData',
        method: 'GET',
      }),
      providesTags: ['SelectableConductors'],
    }),
    getRouteMatcherOptions: builder.query({
      query: () => ({
        url: '/routeTypeOptions',
        method: 'GET',
      }),
      providesTags: ['RouteTypeOptions'],
    }),
    getLocationOptions: builder.query({
      query: () => ({
        url: '/locationOptions',
        method: 'GET',
      }),
      providesTags: ['LocationOptions'],
    }),
    getRouteManagementData: builder.query({
      query: () => ({
        url: '/routeManagementData',
        method: 'GET',
      }),
      providesTags: ['RouteManagementData'],
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
  useGetAssignableVehiclesQuery,
  useGetSelectableDriversQuery,
  useGetSelectableConductorsQuery,
  useGetRouteMatcherOptionsQuery,
  useGetLocationOptionsQuery,
  useGetRouteManagementDataQuery,
} = routeManagementApi;
