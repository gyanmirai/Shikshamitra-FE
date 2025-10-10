import { transportApi } from '../transportApi';

export const vehicleSettingsApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleTypes: builder.query({
      query: () => ({
        url: '/vehicleTypes',
        method: 'GET',
      }),
      providesTags: ['VehicleTypes'],
    }),
    getVehicleDocuments: builder.query({
      query: () => ({
        url: '/vehicleDocuments',
        method: 'GET',
      }),
      providesTags: ['VehicleDocuments'],
    }),
    getServiceTypes: builder.query({
      query: () => ({
        url: '/serviceTypes',
        method: 'GET',
      }),
      providesTags: ['ServiceTypes'],
    }),
    getLicenceTypes: builder.query({
      query: () => ({
        url: '/licenceTypes',
        method: 'GET',
      }),
      providesTags: ['LicenceTypes'],
    }),
    getFuelTypes: builder.query({
      query: () => ({
        url: '/fuelTypes',
        method: 'GET',
      }),
      providesTags: ['FuelTypeOptions'],
    }),
  }),
});

export const {
  useGetVehicleTypesQuery,
  useGetVehicleDocumentsQuery,
  useGetServiceTypesQuery,
  useGetLicenceTypesQuery,
  useGetFuelTypesQuery,
} = vehicleSettingsApi;
