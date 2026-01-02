import { financeModuleApi } from '../financeModuleApi';

export const bankAccountApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query({
      query: (academicYearId) => ({
        url: `/finance/bank-accounts?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['BankAccounts'],
    }),
    addBankAccount: builder.mutation({
      query: (body: any) => ({
        url: `/finance/bank-accounts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccounts'],
    }),
    updateBankAccount: builder.mutation({
      query: ({ bankAccountId, body }: { bankAccountId: string; body: any }) => ({
        url: `/finance/bank-accounts/${bankAccountId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['BankAccounts'],
    }),
    deleteBankAccount: builder.mutation({
      query: ({ bankAccountId }: { bankAccountId: string }) => ({
        url: `/finance/bank-accounts/${bankAccountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccounts'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBankAccountsQuery,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountApi;
