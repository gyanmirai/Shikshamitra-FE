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
    addVehicle: builder.mutation({
      query: (body) => ({
        url: '/vehicles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    uploadVehicleDocument: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/documents`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    vehicleMantenceDetails: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    updateVehicle: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    updateVehicleDocument: builder.mutation({
      query: ({ vehicleId, documentId, body }) => ({
        url: `/vehicles/${vehicleId}/documents/${documentId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    updateVehicleMaintenance: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    addMaintenanceRecord: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    changeVehicleStatus: builder.mutation({
      query: ({ vehicleId, body }) => ({
        url: `/vehicles/${vehicleId}/change-status`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['VehicleManagement'],
    }),
    // GET endpoints for vehicle history
    getVehicleDocuments: builder.query({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}/documents`,
        method: 'GET',
      }),
      providesTags: ['VehicleManagement'],
    }),
    getDriverHistory: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/driver-history`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['VehicleManagement'],
    }),
    getRouteHistory: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/route-history`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['VehicleManagement'],
    }),
    getMaintenanceRecords: builder.query({
      query: ({ vehicleId, page = 1, pageSize = 10 }) => ({
        url: `/vehicles/${vehicleId}/maintenance`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['VehicleManagement'],
    }),
    getVehicleDetails: builder.query({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}`,
        method: 'GET',
      }),
      providesTags: ['VehicleManagement'],
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
