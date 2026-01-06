import { transportApi } from '../transportApi';

export const vehicleSettingsApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Vehicle Type
    getVehicleTypes: builder.query({
      query: () => ({
        url: '/vehicle-types',
        method: 'GET',
      }),
      providesTags: ['VehicleTypes'],
    }),

    addVehicleType: builder.mutation({
      query: (body) => ({
        url: '/vehicle-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VehicleTypes'],
    }),

    updateVehicleType: builder.mutation({
      query: ({ vehicleTypeId, body }) => ({
        url: `/vehicle-types/${vehicleTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['VehicleTypes'],
    }),

    deleteVehicleType: builder.mutation({
      query: (vehicleTypeId) => ({
        url: `/vehicle-types/${vehicleTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VehicleTypes'],
    }),

    // Vehicle Document
    getVehicleDocuments: builder.query({
      query: () => ({
        url: '/required-vehicle-documents',
        method: 'GET',
      }),
      providesTags: ['VehicleDocuments'],
    }),

    addVehicleDocument: builder.mutation({
      query: (body) => ({
        url: '/required-vehicle-documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),

    updateVehicleDocument: builder.mutation({
      query: ({ documentId, body }) => ({
        url: `/required-vehicle-documents/${documentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),

    deleteVehicleDocument: builder.mutation({
      query: (documentId) => ({
        url: `/required-vehicle-documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),

    // Service Type
    getServiceTypes: builder.query({
      query: () => ({
        url: '/servicing-types',
        method: 'GET',
      }),
      providesTags: ['ServiceTypes'],
    }),
    addServiceType: builder.mutation({
      query: (body) => ({
        url: '/servicing-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ServiceTypes'],
    }),
    updateServiceType: builder.mutation({
      query: ({ servicingTypeId, body }) => ({
        url: `/servicing-types/${servicingTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ServiceTypes'],
    }),
    deleteServiceType: builder.mutation({
      query: (servicingTypeId) => ({
        url: `/servicing-types/${servicingTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceTypes'],
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

    // Fee Configuration
    getFeeConfiguration: builder.query({
      query: () => ({
        url: '/fee-configuration',
        method: 'GET',
      }),
      providesTags: ['FeeConfiguration'],
    }),
    addFeeConfiguration: builder.mutation({
      query: (body) => ({
        url: '/fee-configuration',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FeeConfiguration'],
    }),
    updateFeeConfiguration: builder.mutation({
      query: (body) => ({
        url: `/fee-configuration`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FeeConfiguration'],
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
        url: '/zones-areas',
        method: 'GET',
      }),
      providesTags: ['ZoneAreaOptions'],
    }),
    addZoneAreaOptions: builder.mutation({
      query: (body) => ({
        url: '/zones-areas',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ZoneAreaOptions'],
    }),
    updateZoneAreaOptions: builder.mutation({
      query: ({ zoneAreaId, body }) => ({
        url: `/zones-areas/${zoneAreaId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ZoneAreaOptions'],
    }),
    deleteZoneAreaOptions: builder.mutation({
      query: (zoneAreaId) => ({
        url: `/zones-areas/${zoneAreaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ZoneAreaOptions'],
    }),
  }),
});

export const {
  useGetVehicleTypesQuery,
  useAddVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
  useDeleteVehicleTypeMutation,
  useAddVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
  useDeleteVehicleDocumentMutation,
  useAddServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useGetVehicleDocumentsQuery,
  useGetFeeConfigurationQuery,
  useAddFeeConfigurationMutation,
  useUpdateFeeConfigurationMutation,
  useGetServiceTypesQuery,
  useGetLicenceTypesQuery,
  useGetFuelTypesQuery,
  useGetDistanceCalculationOptionsQuery,
  useGetFrequencyOptionsQuery,
  useGetZoneBasedFeeDataQuery,
  useGetAvailableStopsOptionsQuery,
  useGetZoneAreaOptionsQuery,
  useAddZoneAreaOptionsMutation,
  useUpdateZoneAreaOptionsMutation,
  useDeleteZoneAreaOptionsMutation,
} = vehicleSettingsApi;
