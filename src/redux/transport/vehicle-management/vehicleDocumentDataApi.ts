import { transportApi } from '../transportApi';

export const vehicleDocumentDataApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentRows: builder.query({
      query: () => ({
        url: '/documentRows',
        method: 'GET',
      }),
      providesTags: ['DocumentRows'],
    }),
    getvehicleTypeOptions: builder.query({
      query: () => ({
        url: '/vehicleTypeOptions',
        method: 'GET',
      }),
      providesTags: ['VehicleTypeOptions'],
    }),
    getfuelTypeOptions: builder.query({
      query: () => ({
        url: '/fuelTypeOptions',
        method: 'GET',
      }),
      providesTags: ['FuelTypeOptions'],
    }),
    getinsurance: builder.query({
      query: () => ({
        url: '/insurance',
        method: 'GET',
      }),
      providesTags: ['Insurance'],
    }),
    getdriver: builder.query({
      query: () => ({
        url: '/driver',
        method: 'GET',
      }),
      providesTags: ['Driver'],
    }),
    getdocuments: builder.query({
      query: () => ({
        url: '/documents',
        method: 'GET',
      }),
      providesTags: ['Documents'],
    }),
    getmaintenanceHistoryData: builder.query({
      query: () => ({
        url: '/maintenanceHistoryData',
        method: 'GET',
      }),
      providesTags: ['MaintenanceHistory'],
    }),
    getvehicleInformation: builder.query({
      query: () => ({
        url: '/vehicleInformation',
        method: 'GET',
      }),
      providesTags: ['VehicleManagement'],
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
} = vehicleDocumentDataApi;
