import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export interface FinanceScopeOption {
  boardId: string;
  mediumId: string;
  stageId: string;
  standardId: string;
  divisionId: string;
}

export interface FinanceRequestCapability {
  view: boolean;
  add: boolean;
  submit: boolean;
  approve: boolean;
  reject: boolean;
}

export interface FinanceWorkContext {
  academicYearId: string;
  scopeLabel: string;
  canViewAllTenant: boolean;
  scopeOptions: FinanceScopeOption[];
  requestCapabilities: Record<
    'charge' | 'concession' | 'refund' | 'adjustment',
    FinanceRequestCapability
  >;
}

export const financeWorkContextApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceWorkContext: builder.query<FinanceWorkContext, { academicYearId: string }>({
      query: ({ academicYearId }) => ({ url: '/finance/work-context', params: { academicYearId } }),
      providesTags: [financeModuleType.workContext],
    }),
  }),
});

export const { useGetFinanceWorkContextQuery } = financeWorkContextApi;
