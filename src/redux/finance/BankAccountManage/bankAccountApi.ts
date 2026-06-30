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
      }: {
        academicYearId: string;
        page?: number;
        pageSize?: number;
        search?: string;
      }) => ({
        url: '/bank-accounts',
        method: 'GET',
        params: {
          academicYearId,
          page,
          pageSize,
          search: search || undefined,
        },
      }),
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
  }),
  overrideExisting: false,
});

export const {
  useGetBankAccountQuery,
  usePostBankAccountMutation,
  usePutBankAccountMutation,
  useDeleteBankAccountMutation,
  usePatchBankAccountStatusMutation,
} = bankAccountApi;
