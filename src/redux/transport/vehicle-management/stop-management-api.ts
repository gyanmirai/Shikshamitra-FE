import { transportApi } from '../transportApi';

export const stopManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getStopManagementData: builder.query({
      query: () => ({
        url: '/stopManagementData',
        method: 'GET',
      }),
      providesTags: ['StopManagement'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStopManagementDataQuery } = stopManagementApi;
