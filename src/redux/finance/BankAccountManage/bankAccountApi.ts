import { financeModuleApi } from '../financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


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
      providesTags: [financeModuleType.bankAccount],
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
      invalidatesTags: [financeModuleType.bankAccount],
    }),
    putBankAccount: builder.mutation({
      query: ({ bankAccountId, body }: { bankAccountId: string; body: any }) => ({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'PUT',
        data: body,
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
  }),
  overrideExisting: false,
});

export const {
  useGetBankAccountQuery,
  usePostBankAccountMutation,
  usePutBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountApi;
