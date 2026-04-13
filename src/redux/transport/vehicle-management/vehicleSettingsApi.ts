import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export const vehicleSettingsApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Vehicle Type
    getVehicleTypes: builder.query({
      query: () => ({
        url: '/vehicle-types',
        method: 'GET',
      }),
      providesTags: [transportType.vehicleTypes],
    }),

    addVehicleType: builder.mutation({
      query: (body) => ({
        url: '/vehicle-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.vehicleTypes],
    }),

    updateVehicleType: builder.mutation({
      query: ({ vehicleTypeId, body }) => ({
        url: `/vehicle-types/${vehicleTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [transportType.vehicleTypes],
    }),

    deleteVehicleType: builder.mutation({
      query: (vehicleTypeId) => ({
        url: `/vehicle-types/${vehicleTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [transportType.vehicleTypes],
    }),

    // Vehicle Document
    getVehicleDocuments: builder.query({
      query: () => ({
        url: '/required-vehicle-documents',
        method: 'GET',
      }),
      providesTags: [transportType.vehicleDocuments],
    }),

    addVehicleDocument: builder.mutation({
      query: (body) => ({
        url: '/required-vehicle-documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.vehicleDocuments],
    }),

    updateVehicleDocument: builder.mutation({
      query: ({ documentId, body }) => ({
        url: `/required-vehicle-documents/${documentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [transportType.vehicleDocuments],
    }),

    deleteVehicleDocument: builder.mutation({
      query: (documentId) => ({
        url: `/required-vehicle-documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [transportType.vehicleDocuments],
    }),

    // Service Type
    getServiceTypes: builder.query({
      query: () => ({
        url: '/servicing-types',
        method: 'GET',
      }),
      providesTags: [transportType.serviceTypes],
    }),
    addServiceType: builder.mutation({
      query: (body) => ({
        url: '/servicing-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.serviceTypes],
    }),
    updateServiceType: builder.mutation({
      query: ({ servicingTypeId, body }) => ({
        url: `/servicing-types/${servicingTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [transportType.serviceTypes],
    }),
    deleteServiceType: builder.mutation({
      query: (servicingTypeId) => ({
        url: `/servicing-types/${servicingTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [transportType.serviceTypes],
    }),
    getLicenceTypes: builder.query({
      query: () => ({
        url: '/licenceTypes',
        method: 'GET',
      }),
      providesTags: [transportType.licenceTypes],
    }),
    getFuelTypes: builder.query({
      query: () => ({
        url: '/fuelTypes',
        method: 'GET',
      }),
      providesTags: [transportType.fuelTypeOptions],
    }),

    // Fee Configuration
    getFeeConfiguration: builder.query({
      query: () => ({
        url: '/fee-configuration',
        method: 'GET',
      }),
      providesTags: [transportType.feeConfiguration],
    }),
    addFeeConfiguration: builder.mutation({
      query: (body) => ({
        url: '/fee-configuration',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.feeConfiguration],
    }),
    updateFeeConfiguration: builder.mutation({
      query: (body) => ({
        url: `/fee-configuration`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [transportType.feeConfiguration],
    }),

    getDistanceCalculationOptions: builder.query({
      query: () => ({
        url: '/distanceCalculationOptions',
        method: 'GET',
      }),
      providesTags: [transportType.distanceCalculationOptions],
    }),
    getFrequencyOptions: builder.query({
      query: () => ({
        url: '/frequencyOptions',
        method: 'GET',
      }),
      providesTags: [transportType.frequencyOptions],
    }),
    getZoneBasedFeeData: builder.query({
      query: () => ({
        url: '/zoneBasedFeeData',
        method: 'GET',
      }),
      providesTags: [transportType.zoneBasedFeeData],
    }),
    getAvailableStopsOptions: builder.query({
      query: () => ({
        url: '/availableStopsOptions',
        method: 'GET',
      }),
      providesTags: [transportType.availableStopsOptions],
    }),

    getZoneAreaOptions: builder.query({
      query: () => ({
        url: '/zones-areas',
        method: 'GET',
      }),
      providesTags: [transportType.zoneAreaOptions],
    }),
    addZoneAreaOptions: builder.mutation({
      query: (body) => ({
        url: '/zones-areas',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.zoneAreaOptions],
    }),
    updateZoneAreaOptions: builder.mutation({
      query: ({ zoneAreaId, body }) => ({
        url: `/zones-areas/${zoneAreaId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [transportType.zoneAreaOptions],
    }),
    deleteZoneAreaOptions: builder.mutation({
      query: (zoneAreaId) => ({
        url: `/zones-areas/${zoneAreaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [transportType.zoneAreaOptions],
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
