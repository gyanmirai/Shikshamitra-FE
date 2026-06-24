import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type VehicleListQuery = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: number | string;
  vehicleTypeId?: string;
  fuelTypeId?: string;
  academicMediumId?: string;
};

type VehicleScopedQuery = {
  vehicleId?: string;
  academicMediumId?: string;
  pageNumber?: number;
  pageSize?: number;
};

type VehicleOptionsQuery = {
  academicMediumId?: string;
  onlyAssignable?: boolean;
};

const unwrapResult = (response: any) => response?.data ?? response;

export const buildVehicleListRequest = (params?: VehicleListQuery | void) => {
  const {
    pageNumber = 1,
    pageSize = 10,
    search,
    status,
    vehicleTypeId,
    fuelTypeId,
    academicMediumId,
  } = params ?? {};

  return {
    url: '/transport/vehicles',
    method: 'GET',
    params: { pageNumber, pageSize, search, status, vehicleTypeId, fuelTypeId, academicMediumId },
  };
};

export const normalizeVehicleListResponse = (response: any) => {
  const payload = unwrapResult(response);
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

export const normalizePagedItems = (response: any) => {
  const payload = unwrapResult(response);
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

export const buildVehicleOptionsRequest = (params?: VehicleOptionsQuery | void) => {
  const { academicMediumId, onlyAssignable = false } = params ?? {};
  return {
    url: '/transport/vehicles/options',
    method: 'GET',
    params: { academicMediumId, onlyAssignable },
  };
};

export const vehicleManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleManagementData: builder.query<any, VehicleListQuery | void>({
      query: buildVehicleListRequest,
      transformResponse: normalizeVehicleListResponse,
      providesTags: [transportType.vehicleManagement],
    }),
    getVehicleOptions: builder.query<any, VehicleOptionsQuery | void>({
      query: buildVehicleOptionsRequest,
      transformResponse: (response: any) => unwrapResult(response) ?? [],
      providesTags: [transportType.vehicleManagement, transportType.assignableVehicles],
    }),
    addVehicle: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/vehicles',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement],
    }),
    uploadVehicleDocument: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/documents`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement, transportType.vehicleDocuments],
    }),
    vehicleMantenceDetails: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/compliance`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement],
    }),
    updateVehicle: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: transportType.vehicleManagement, id: vehicleId },
        transportType.vehicleManagement,
      ],
    }),
    updateVehicleDocument: builder.mutation({
      query: ({ vehicleId, documentId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/documents/${documentId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement, transportType.vehicleDocuments],
    }),
    updateVehicleMaintenance: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/compliance`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement],
    }),
    addMaintenanceRecord: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/maintenance-records`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleManagement, transportType.maintenanceHistory],
    }),
    changeVehicleStatus: builder.mutation({
      query: ({ vehicleId, body, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: (result, error, { vehicleId }) => [
        { type: transportType.vehicleManagement, id: vehicleId },
        transportType.vehicleManagement,
      ],
    }),
    getVehicleDocuments: builder.query({
      query: ({ vehicleId, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/documents`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.vehicleDocuments],
    }),
    downloadVehicleDocument: builder.query<Blob, VehicleScopedQuery & { documentId?: string }>({
      query: ({ vehicleId, documentId, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/documents/${documentId}`,
        method: 'GET',
        params: { academicMediumId },
        responseHandler: (response) => response.blob(),
      }),
    }),
    deleteVehicleDocument: builder.mutation({
      query: ({ vehicleId, documentId, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}/documents/${documentId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [transportType.vehicleManagement, transportType.vehicleDocuments],
    }),
    getDriverHistory: builder.query<any, VehicleScopedQuery>({
      query: (params) => {
        const { vehicleId, academicMediumId, pageNumber = 1, pageSize = 10 } = params;
        return {
          url: `/transport/vehicles/${vehicleId}/driver-history`,
          method: 'GET',
          params: { pageNumber, pageSize, academicMediumId },
        };
      },
      transformResponse: normalizePagedItems,
      providesTags: [transportType.driverHistory],
    }),
    getRouteHistory: builder.query<any, VehicleScopedQuery>({
      query: (params) => {
        const { vehicleId, academicMediumId, pageNumber = 1, pageSize = 10 } = params;
        return {
          url: `/transport/vehicles/${vehicleId}/route-history`,
          method: 'GET',
          params: { pageNumber, pageSize, academicMediumId },
        };
      },
      transformResponse: normalizePagedItems,
      providesTags: [transportType.routeHistoryData],
    }),
    getMaintenanceRecords: builder.query<any, VehicleScopedQuery>({
      query: (params) => {
        const { vehicleId, academicMediumId, pageNumber = 1, pageSize = 10 } = params;
        return {
          url: `/transport/vehicles/${vehicleId}/maintenance-records`,
          method: 'GET',
          params: { pageNumber, pageSize, academicMediumId },
        };
      },
      transformResponse: normalizePagedItems,
      providesTags: [transportType.maintenanceHistory],
    }),
    getVehicleDetails: builder.query({
      query: ({ vehicleId, academicMediumId }) => ({
        url: `/transport/vehicles/${vehicleId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      providesTags: (result, error, { vehicleId }) => [
        { type: transportType.vehicleManagement, id: vehicleId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVehicleManagementDataQuery,
  useGetVehicleOptionsQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useUploadVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
  useVehicleMantenceDetailsMutation,
  useUpdateVehicleMaintenanceMutation,
  useAddMaintenanceRecordMutation,
  useChangeVehicleStatusMutation,
  useGetVehicleDocumentsQuery,
  useLazyDownloadVehicleDocumentQuery,
  useDeleteVehicleDocumentMutation,
  useGetDriverHistoryQuery,
  useGetRouteHistoryQuery,
  useGetMaintenanceRecordsQuery,
  useGetVehicleDetailsQuery,
} = vehicleManagementApi;
