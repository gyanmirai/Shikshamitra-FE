import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type AcademicMediumQuery = {
  academicMediumId?: string;
};

type FeeRunListQuery = AcademicMediumQuery & {
  academicYearId?: string;
  pageNumber?: number;
  pageSize?: number;
  status?: number;
  periodFrom?: string;
  periodTo?: string;
};

type FeeDueListQuery = AcademicMediumQuery & {
  academicYearId?: string;
  pageNumber?: number;
  pageSize?: number;
  memberType?: number;
  status?: number;
  routeId?: string;
  stopId?: string;
  runId?: string;
};

type TransportMemberDueQuery = AcademicMediumQuery & {
  memberId?: string;
  pageNumber?: number;
  pageSize?: number;
};

const unwrapResult = (response: any) =>
  response && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : (response ?? []);

const academicParams = (params?: AcademicMediumQuery | void) => ({
  academicMediumId: params?.academicMediumId,
});

export const buildVehicleTypeListRequest = (params?: AcademicMediumQuery | void) => ({
  url: '/transport/vehicle-types',
  method: 'GET',
  params: academicParams(params),
});

export const buildFuelTypeListRequest = (params?: AcademicMediumQuery | void) => ({
  url: '/transport/fuel-types',
  method: 'GET',
  params: academicParams(params),
});

export const buildFeeConfigurationRequest = (params?: AcademicMediumQuery | void) => ({
  url: '/transport/fee-configuration',
  method: 'GET',
  params: academicParams(params),
});

export const buildFeeFrequencyOptionsRequest = () => ({
  url: '/transport/fee-frequency-options',
  method: 'GET',
});

export const buildZoneAreaListRequest = (params?: AcademicMediumQuery | void) => ({
  url: '/transport/zones-areas',
  method: 'GET',
  params: academicParams(params),
});

export const buildFeeRunListRequest = (params?: FeeRunListQuery | void) => ({
  url: '/transport/fees/runs',
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
    academicYearId: params?.academicYearId,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 10,
    status: params?.status,
    periodFrom: params?.periodFrom,
    periodTo: params?.periodTo,
  },
});

export const buildFeeDuesListRequest = (params?: FeeDueListQuery | void) => ({
  url: '/transport/fees/dues',
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
    academicYearId: params?.academicYearId,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 10,
    memberType: params?.memberType,
    status: params?.status,
    routeId: params?.routeId,
    stopId: params?.stopId,
    runId: params?.runId,
  },
});

export const buildTransportMemberDuesRequest = (params?: TransportMemberDueQuery | void) => ({
  url: `/transport/members/${params?.memberId}/dues`,
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 10,
  },
});

export const vehicleSettingsApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleTypes: builder.query({
      query: buildVehicleTypeListRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.vehicleTypes],
    }),

    addVehicleType: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/vehicle-types',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleTypes, transportType.vehicleTypeOptions],
    }),

    updateVehicleType: builder.mutation({
      query: ({ vehicleTypeId, body, academicMediumId }) => ({
        url: `/transport/vehicle-types/${vehicleTypeId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleTypes, transportType.vehicleTypeOptions],
    }),

    deleteVehicleType: builder.mutation({
      query: ({ vehicleTypeId, academicMediumId }) => ({
        url: `/transport/vehicle-types/${vehicleTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [transportType.vehicleTypes, transportType.vehicleTypeOptions],
    }),

    getVehicleDocuments: builder.query({
      query: (params?: AcademicMediumQuery | void) => ({
        url: '/transport/required-vehicle-documents',
        method: 'GET',
        params: academicParams(params),
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.vehicleDocuments],
    }),

    addVehicleDocument: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/required-vehicle-documents',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleDocuments, transportType.documentRows],
    }),

    updateVehicleDocument: builder.mutation({
      query: ({ documentId, body, academicMediumId }) => ({
        url: `/transport/required-vehicle-documents/${documentId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.vehicleDocuments, transportType.documentRows],
    }),

    deleteVehicleDocument: builder.mutation({
      query: ({ documentId, academicMediumId }) => ({
        url: `/transport/required-vehicle-documents/${documentId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [transportType.vehicleDocuments, transportType.documentRows],
    }),

    getServiceTypes: builder.query({
      query: (params?: AcademicMediumQuery | void) => ({
        url: '/transport/servicing-types',
        method: 'GET',
        params: academicParams(params),
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.serviceTypes],
    }),
    addServiceType: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/servicing-types',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.serviceTypes],
    }),
    updateServiceType: builder.mutation({
      query: ({ servicingTypeId, body, academicMediumId }) => ({
        url: `/transport/servicing-types/${servicingTypeId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.serviceTypes],
    }),
    deleteServiceType: builder.mutation({
      query: ({ servicingTypeId, academicMediumId }) => ({
        url: `/transport/servicing-types/${servicingTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
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
      query: buildFuelTypeListRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.fuelTypes, transportType.fuelTypeOptions],
    }),
    addFuelType: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/fuel-types',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.fuelTypes, transportType.fuelTypeOptions],
    }),
    updateFuelType: builder.mutation({
      query: ({ fuelTypeId, body, academicMediumId }) => ({
        url: `/transport/fuel-types/${fuelTypeId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.fuelTypes, transportType.fuelTypeOptions],
    }),
    deleteFuelType: builder.mutation({
      query: ({ fuelTypeId, academicMediumId }) => ({
        url: `/transport/fuel-types/${fuelTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [transportType.fuelTypes, transportType.fuelTypeOptions],
    }),

    getFeeConfiguration: builder.query({
      query: buildFeeConfigurationRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.feeConfiguration],
    }),
    addFeeConfiguration: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: '/transport/fee-configuration',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.feeConfiguration],
    }),
    updateFeeConfiguration: builder.mutation({
      query: ({ configurationId, academicMediumId, body }) => ({
        url: `/transport/fee-configuration/${configurationId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
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
      query: buildFeeFrequencyOptionsRequest,
      transformResponse: unwrapResult,
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
      query: buildZoneAreaListRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.zoneAreaOptions],
    }),
    addZoneAreaOptions: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: '/transport/zones-areas',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.zoneAreaOptions],
    }),
    updateZoneAreaOptions: builder.mutation({
      query: ({ zoneAreaId, academicMediumId, body }) => ({
        url: `/transport/zones-areas/${zoneAreaId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.zoneAreaOptions],
    }),
    deleteZoneAreaOptions: builder.mutation({
      query: ({ zoneAreaId, academicMediumId }) => ({
        url: `/transport/zones-areas/${zoneAreaId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [transportType.zoneAreaOptions],
    }),
    previewFeeRun: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: '/transport/fees/runs/preview',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
    }),
    createFeeRun: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: '/transport/fees/runs',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.feeRuns, transportType.feeDues],
    }),
    getFeeRuns: builder.query({
      query: buildFeeRunListRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.feeRuns],
    }),
    getFeeRun: builder.query({
      query: ({ runId, academicMediumId }) => ({
        url: `/transport/fees/runs/${runId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.feeRuns, transportType.feeDues],
    }),
    postFeeRunToFinance: builder.mutation({
      query: ({ runId, academicMediumId }) => ({
        url: `/transport/fees/runs/${runId}/post-finance`,
        method: 'POST',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.feeRuns, transportType.feeDues],
    }),
    getTransportFeeDues: builder.query({
      query: buildFeeDuesListRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.feeDues],
    }),
    getTransportMemberDues: builder.query({
      query: buildTransportMemberDuesRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.feeDues],
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
  useAddFuelTypeMutation,
  useUpdateFuelTypeMutation,
  useDeleteFuelTypeMutation,
  useGetDistanceCalculationOptionsQuery,
  useGetFrequencyOptionsQuery,
  useGetZoneBasedFeeDataQuery,
  useGetAvailableStopsOptionsQuery,
  useGetZoneAreaOptionsQuery,
  useAddZoneAreaOptionsMutation,
  useUpdateZoneAreaOptionsMutation,
  useDeleteZoneAreaOptionsMutation,
  usePreviewFeeRunMutation,
  useCreateFeeRunMutation,
  useGetFeeRunsQuery,
  useGetFeeRunQuery,
  usePostFeeRunToFinanceMutation,
  useGetTransportFeeDuesQuery,
  useGetTransportMemberDuesQuery,
} = vehicleSettingsApi;
