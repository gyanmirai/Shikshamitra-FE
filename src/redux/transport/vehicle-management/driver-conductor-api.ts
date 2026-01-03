import { transportApi } from '../transportApi';

export const driverConductorApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverConductorData: builder.query({
      query: () => ({
        url: '/transport/staff',
        method: 'GET',
      }),
      providesTags: ['DriverConductorData'],
    }),

    getDriverConductorById: builder.query({
      query: (staffId: string) => ({
        url: `/transport/staff/${staffId}`,
        method: 'GET',
      }),
      providesTags: ['DriverConductorData'],
    }),

    addDriverConductor: builder.mutation({
      query: ({ staffId, data }: { staffId: string; data: any }) => ({
        url: `/transport/staff/${staffId}/assign-route`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DriverConductorData'],
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

export const {
  useGetDriverConductorDataQuery,
  useGetDriverConductorByIdQuery,
  useGetAvailableRoutesQuery,
  useAddDriverConductorMutation,
} = driverConductorApi;
