import { transportApi } from '../transportApi';

export const driverConductorApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverConductorData: builder.query({
      query: () => ({
        url: '/driverConductorData',
        method: 'GET',
      }),
      providesTags: ['DriverConductorData'],
    }),
    getAvailableRoutes: builder.query({
      query: () => ({
        url: '/availableRoutes',
        method: 'GET',
      }),
      providesTags: ['AvailableRoutes'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDriverConductorDataQuery, useGetAvailableRoutesQuery } = driverConductorApi;
