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
    getStopBasedFeeData: builder.query({
      query: () => ({
        url: '/stopBasedFeeData',
        method: 'GET',
      }),
      providesTags: ['StopBasedFeeData'],
    }),
    getDistanceCalculationOptions: builder.query({
      query: () => ({
        url: '/distanceCalculationOptions',
        method: 'GET',
      }),
      providesTags: ['DistanceCalculationOptions'],
    }),
    getFrequencyOptions: builder.query({
      query: () => ({
        url: '/frequencyOptions',
        method: 'GET',
      }),
      providesTags: ['FrequencyOptions'],
    }),
    getZoneBasedFeeData: builder.query({
      query: () => ({
        url: '/zoneBasedFeeData',
        method: 'GET',
      }),
      providesTags: ['ZoneBasedFeeData'],
    }),
    getAvailableStopsOptions: builder.query({
      query: () => ({
        url: '/availableStopsOptions',
        method: 'GET',
      }),
      providesTags: ['AvailableStopsOptions'],
    }),
    getZoneAreaOptions: builder.query({
      query: () => ({
        url: '/zoneAreas',
        method: 'GET',
      }),
      providesTags: ['ZoneAreaOptions'],
    }),
  }),
});

export const {
  useGetVehicleTypesQuery,
  useGetVehicleDocumentsQuery,
  useGetServiceTypesQuery,
  useGetLicenceTypesQuery,
  useGetFuelTypesQuery,
  useGetStopBasedFeeDataQuery,
  useGetDistanceCalculationOptionsQuery,
  useGetFrequencyOptionsQuery,
  useGetZoneBasedFeeDataQuery,
  useGetAvailableStopsOptionsQuery,
  useGetZoneAreaOptionsQuery,
} = vehicleSettingsApi;
