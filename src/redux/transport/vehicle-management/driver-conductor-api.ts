import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export const driverConductorApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverConductorData: builder.query({
      query: () => ({
        url: '/transport/staff',
        method: 'GET',
      }),
      providesTags: [transportType.driverConductorData],
    }),

    getDriverConductorById: builder.query({
      query: (staffId: string) => ({
        url: `/transport/staff/${staffId}`,
        method: 'GET',
      }),
      providesTags: [transportType.driverConductorData],
    }),

    addDriverConductor: builder.mutation({
      query: ({ staffId, data }: { staffId: string; data: any }) => ({
        url: `/transport/staff/${staffId}/assign-route`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [transportType.driverConductorData],
    }),

    getAvailableRoutes: builder.query({
      query: () => ({
        url: '/availableRoutes',
        method: 'GET',
      }),
      providesTags: [transportType.availableRoutes],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDriverConductorDataQuery,
  useGetDriverConductorByIdQuery,
  useGetAvailableRoutesQuery,
  useAddDriverConductorMutation,
} = driverConductorApi;
