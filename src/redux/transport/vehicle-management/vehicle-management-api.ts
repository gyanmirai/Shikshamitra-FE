import { transportApi } from '../transportApi';

export const vehicleManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleManagementData: builder.query({
      query: () => ({
        url: '/vehicleManagementData',
        method: 'GET',
      }),
      providesTags: ['VehicleManagement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetVehicleManagementDataQuery } = vehicleManagementApi;
