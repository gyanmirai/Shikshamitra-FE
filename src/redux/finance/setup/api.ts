import { paymentTermType, financeModuleType, financePolicyType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

import type { FinanceSetupScope, FinanceSetupState, FinanceSetupProgress } from './types';

export const financeSetupApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    financeSetupState: builder.query<FinanceSetupState, FinanceSetupScope>({
      query: ({ academicYearId }) => `/finance/setup/${academicYearId}`,
      providesTags: [
        financeModuleType.setupGuide,
        financeModuleType.incomeCategoryData,
        financeModuleType.incomeCategories,
        financeModuleType.expenseCategory,
        financeModuleType.bankAccount,
        financeModuleType.bankAccounts,
        financeModuleType.feeCategory,
        financeModuleType.feeHead,
        financeModuleType.chargeCategory,
        financeModuleType.concessionType,
        financeModuleType.feeStructure,
        paymentTermType.paymentTerm,
        financePolicyType.financePolicy,
        financePolicyType.collectionPolicy,
        financePolicyType.refundPolicy,
        financePolicyType.concessionPolicy,
        financePolicyType.prorationPolicy,
      ],
    }),
    saveFinanceSetupProgress: builder.mutation<
      FinanceSetupState,
      { scope: FinanceSetupScope; progress: FinanceSetupProgress }
    >({
      query: ({ scope, progress }) => ({
        url: `/finance/setup/${scope.academicYearId}/progress`,
        method: 'PUT',
        body: progress,
      }),
      async onQueryStarted({ scope }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.academicYearId === scope.academicYearId) {
            dispatch(financeSetupApi.util.upsertQueryData('financeSetupState', scope, data));
          }
        } catch {
          /* The guide retains its position and offers retry or conflict reload. */
        }
      },
    }),
  }),
});

export const { useFinanceSetupStateQuery, useSaveFinanceSetupProgressMutation } = financeSetupApi;
