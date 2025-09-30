import { financeModuleApi } from '../financeModuleApi';

export const studentChargeDataApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentCharges: builder.query({
      query: () => ({
        url: '/studentChargeData', // replace with your actual endpoint
        method: 'GET',
      }),
      providesTags: ['StudentCharges'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStudentChargesQuery } = studentChargeDataApi;
