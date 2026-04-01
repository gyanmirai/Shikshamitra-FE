import { financeModuleApi } from '../financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const studentChargeDataApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentCharges: builder.query({
      query: () => ({
        url: '/studentChargeData', // replace with your actual endpoint
        method: 'GET',
      }),
      providesTags: [financeModuleType.studentCharges],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStudentChargesQuery } = studentChargeDataApi;
