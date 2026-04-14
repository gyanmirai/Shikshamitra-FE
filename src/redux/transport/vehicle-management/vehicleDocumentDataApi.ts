import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export const vehicleDocumentDataApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentRows: builder.query({
      query: () => ({
        url: '/documentRows',
        method: 'GET',
      }),
      providesTags: [transportType.documentRows],
    }),
    getvehicleTypeOptions: builder.query({
      query: () => ({
        url: '/vehicleTypeOptions',
        method: 'GET',
      }),
      providesTags: [transportType.vehicleTypeOptions],
    }),
    getfuelTypeOptions: builder.query({
      query: () => ({
        url: '/fuelTypeOptions',
        method: 'GET',
      }),
      providesTags: [transportType.fuelTypeOptions],
    }),
    getinsurance: builder.query({
      query: () => ({
        url: '/insurance',
        method: 'GET',
      }),
      providesTags: [transportType.insurance],
    }),
    getdriver: builder.query({
      query: () => ({
        url: '/driver',
        method: 'GET',
      }),
      providesTags: [transportType.driver],
    }),
    getdocuments: builder.query({
      query: () => ({
        url: '/documents',
        method: 'GET',
      }),
      providesTags: [transportType.documents],
    }),
    getmaintenanceHistoryData: builder.query({
      query: () => ({
        url: '/maintenanceHistoryData',
        method: 'GET',
      }),
      providesTags: [transportType.maintenanceHistory],
    }),
    getvehicleInformation: builder.query({
      query: () => ({
        url: '/vehicleInformation',
        method: 'GET',
      }),
      providesTags: [transportType.vehicleManagement],
    }),
    getrouteHistoryData: builder.query({
      query: () => ({
        url: '/routeHistoryData',
        method: 'GET',
      }),
      providesTags: [transportType.routeHistoryData],
    }),
    getdriverHistoryData: builder.query({
      query: () => ({
        url: '/driverHistoryData',
        method: 'GET',
      }),
      providesTags: [transportType.driverHistory],
    }),
    getmaintenanceData: builder.query({
      query: () => ({
        url: '/maintenanceData',
        method: 'GET',
      }),
      providesTags: [transportType.maintenanceData],
    }),
    getdocumentDetailsData: builder.query({
      query: () => ({
        url: '/documentDetailsData',
        method: 'GET',
      }),
      providesTags: [transportType.documentDetailsData],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentRowsQuery,
  useGetdriverQuery,
  useGetdocumentsQuery,
  useGetfuelTypeOptionsQuery,
  useGetinsuranceQuery,
  useGetmaintenanceHistoryDataQuery,
  useGetvehicleTypeOptionsQuery,
  useGetvehicleInformationQuery,
  useGetrouteHistoryDataQuery,
  useGetdriverHistoryDataQuery,
  useGetmaintenanceDataQuery,
  useGetdocumentDetailsDataQuery,
} = vehicleDocumentDataApi;
