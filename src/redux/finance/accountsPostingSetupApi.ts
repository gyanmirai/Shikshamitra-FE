import { financeModuleApi } from './financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';

export type PostingSetup = {
  academicYearId: string;
  isEnabled: boolean;
  firstPostingDate: string | null;
  cashAccountHeadId: string | null;
  periods: { id: string; code: string; startsOn: string; endsOn: string; isOpen: boolean }[];
  destinations: {
    id: string;
    method: number;
    direction: number;
    assetAccountHeadId: string;
    bankAccountId: string | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    isActive: boolean;
  }[];
  readinessIssues: string[];
};

export const accountsPostingSetupApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountsPostingSetup: builder.query<PostingSetup, string>({
      query: (academicYearId) => ({ url: '/accounts/posting-setup', params: { academicYearId } }),
      providesTags: [financeModuleType.accountPosting],
    }),
    configureAccountsPosting: builder.mutation<
      PostingSetup,
      { academicYearId: string; firstPostingDate: string; cashAccountHeadId: string }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: '/accounts/posting-setup', method: 'PUT', params: { academicYearId }, body,
      }),
      invalidatesTags: [financeModuleType.accountPosting],
    }),
    addAccountingPeriod: builder.mutation<
      PostingSetup,
      { academicYearId: string; code: string; startsOn: string; endsOn: string }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: '/accounts/posting-setup/periods', method: 'POST', params: { academicYearId }, body,
      }),
      invalidatesTags: [financeModuleType.accountPosting],
    }),
    addPaymentDestination: builder.mutation<
      PostingSetup,
      { academicYearId: string; method: number; direction: number; assetAccountHeadId: string;
        bankAccountId: string | null; effectiveFrom: string; effectiveTo: string | null }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: '/accounts/posting-setup/destinations', method: 'POST', params: { academicYearId }, body,
      }),
      invalidatesTags: [financeModuleType.accountPosting],
    }),
    endPaymentDestination: builder.mutation<
      PostingSetup,
      { academicYearId: string; id: string; lastEffectiveDate: string }
    >({
      query: ({ academicYearId, id, lastEffectiveDate }) => ({
        url: `/accounts/posting-setup/destinations/${id}/end`, method: 'POST',
        params: { academicYearId }, body: { lastEffectiveDate },
      }),
      invalidatesTags: [financeModuleType.accountPosting],
    }),
  }),
});

export const {
  useGetAccountsPostingSetupQuery,
  useConfigureAccountsPostingMutation,
  useAddAccountingPeriodMutation,
  useAddPaymentDestinationMutation,
  useEndPaymentDestinationMutation,
} = accountsPostingSetupApi;
