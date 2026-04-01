import { transportApi } from '../transportApi';
import { transportType } from 'src/redux/tagTypes';


export const vehicleManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleManagementData: builder.query({
      query: () => ({
        url: '/vehicleManagementData',
        method: 'GET',
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    addVehicle: builder.mutation({
      query: (body) => ({
        url: '/vehicles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    uploadVehicleDocument: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/documents`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    vehicleMantenceDetails: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    updateVehicle: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    updateVehicleDocument: builder.mutation({
      query: ({ vehicleId, documentId, body }) => ({
        url: `/vehicles/${vehicleId}/documents/${documentId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    updateVehicleMaintenance: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    addMaintenanceRecord: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    changeVehicleStatus: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/change-status`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [transportType.vehicleManagement],
    }),
    // GET endpoints for vehicle history
    getVehicleDocuments: builder.query({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}/documents`,
        method: 'GET',
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    getDriverHistory: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/driver-history`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    getRouteHistory: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/route-history`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    getMaintenanceRecords: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    getVehicleDetails: builder.query({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}`,
        method: 'GET',
      }),
      providesTags: [transportType.vehicleManagement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVehicleManagementDataQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useUploadVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
  useVehicleMantenceDetailsMutation,
  useUpdateVehicleMaintenanceMutation,
  useAddMaintenanceRecordMutation,
  useChangeVehicleStatusMutation,
  useGetVehicleDocumentsQuery,
  useGetDriverHistoryQuery,
  useGetRouteHistoryQuery,
  useGetMaintenanceRecordsQuery,
  useGetVehicleDetailsQuery,
} = vehicleManagementApi;
