import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const bankAccountApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccount: builder.query({
      query: ({
        academicYearId,
        page,
        pageSize,
        search,
        filters,
        includeInactive = true,
      }: {
        academicYearId: string;
        page?: number;
        pageSize?: number;
        search?: string;
        filters?: string;
        includeInactive?: boolean;
      }) => ({
        url: '/bank-accounts',
        method: 'GET',
        params: {
          academicYearId,
          page,
          pageSize,
          search: search || undefined,
          filters,
          includeInactive,
        },
      }),
      providesTags: [financeModuleType.bankAccount],
    }),
    getBankAccountById: builder.query({
      query: (id: string) => ({ url: `/bank-accounts/${id}`, method: 'GET' }),
      providesTags: [financeModuleType.bankAccount],
    }),
    postBankAccount: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/bank-accounts',
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.bankAccount],
    }),
    putBankAccount: builder.mutation({
      query: ({ bankAccountId, body }: { bankAccountId: string; body: any }) => ({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.bankAccount],
    }),
    deleteBankAccount: builder.mutation({
      query: (bankAccountId: string) => ({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.bankAccount],
    }),
    patchBankAccountStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/bank-accounts/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.bankAccount],
    }),
    getBankAccountVersions: builder.query({
      query: (id: string) => ({ url: `/bank-accounts/${id}/versions`, method: 'GET' }),
      providesTags: [financeModuleType.bankAccount],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBankAccountQuery,
  useGetBankAccountByIdQuery,
  useLazyGetBankAccountByIdQuery,
  usePostBankAccountMutation,
  usePutBankAccountMutation,
  useDeleteBankAccountMutation,
  usePatchBankAccountStatusMutation,
  useGetBankAccountVersionsQuery,
} = bankAccountApi;
