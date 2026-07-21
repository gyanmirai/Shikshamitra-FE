import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export interface IFeeHeadModuleOption {
  value: string;
  displayName: string;
}

export const feeHeadModuleApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head module lookup list
    getFeeHeadModules: builder.query<IFeeHeadModuleOption[], void>({
      query: () => ({
        url: '/fee-head-modules',
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeHeadModule],
    }),
  }),
});

export const { useGetFeeHeadModulesQuery } = feeHeadModuleApi;
