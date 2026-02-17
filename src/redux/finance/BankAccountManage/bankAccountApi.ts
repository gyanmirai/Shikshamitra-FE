import { financeModuleApi } from '../financeModuleApi';

export const bankAccountApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccount: builder.query({
      query: ({ academicYearId }: { academicYearId: string }) => ({
        url: '/bank-accounts',
        method: 'GET',
        params: {
          academicYearId,
        },
      }),
      providesTags: ['bank-account'],
    }),
    postBankAccount: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/bank-accounts',
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['bank-account'],
    }),
    putBankAccount: builder.mutation({
      query: ({ bankAccountId, body }: { bankAccountId: string; body: any }) => ({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['bank-account'],
    }),
    deleteBankAccount: builder.mutation({
      query: (bankAccountId: string) => ({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['bank-account'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBankAccountQuery,
  usePostBankAccountMutation,
  usePutBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountApi;
