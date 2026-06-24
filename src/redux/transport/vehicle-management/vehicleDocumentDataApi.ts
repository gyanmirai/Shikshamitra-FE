import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type AcademicMediumQuery = {
  academicMediumId?: string;
};

const unwrapResult = (response: any) => response?.data ?? response ?? [];

const academicParams = (params?: AcademicMediumQuery | void) => ({
  academicMediumId: params?.academicMediumId,
});

export const normalizeRequiredDocumentRows = (response: any) =>
  unwrapResult(response).map((document: any, index: number) => ({
    ...document,
    key: index,
    id: document.id,
    requiredDocumentId: document.id,
    name: document.name ?? document.documentName,
  }));

export const vehicleDocumentDataApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentRows: builder.query({
      query: (params?: AcademicMediumQuery | void) => ({
        url: '/transport/required-vehicle-documents',
        method: 'GET',
        params: academicParams(params),
      }),
      transformResponse: normalizeRequiredDocumentRows,
      providesTags: [transportType.documentRows],
    }),
    getvehicleTypeOptions: builder.query({
      query: (params?: AcademicMediumQuery | void) => ({
        url: '/transport/vehicle-types/options',
        method: 'GET',
        params: academicParams(params),
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.vehicleTypeOptions],
    }),
    getfuelTypeOptions: builder.query({
      query: (params?: AcademicMediumQuery | void) => ({
        url: '/transport/fuel-types/options',
        method: 'GET',
        params: academicParams(params),
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.fuelTypeOptions],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentRowsQuery,
  useGetfuelTypeOptionsQuery,
  useGetvehicleTypeOptionsQuery,
} = vehicleDocumentDataApi;
