import { financeModuleApi } from '../financeModuleApi';

export const bankAccountApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query({
      query: () => ({
        url: '/bankAccountData',
        method: 'GET',
      }),
      providesTags: ['BankAccounts'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBankAccountsQuery } = bankAccountApi;
