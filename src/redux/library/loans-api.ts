import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryCalendarReadTag } from './operational-settings-tags';
import { libraryCirculationMutationTags } from './library-cache-tags';

import type { LibraryLoan, LibraryLoanCommandResult } from './circulation-types';
import type {
  LibraryRenewRequest,
  LibraryLoanReturnRequest,
  LibraryRenewalPlanRequest,
  LibraryLoanDateReviewRequest,
} from './circulation-commands';

export type RenewalPlan = {
  loan: LibraryLoan;
  currentAcademicYearId: string | null;
  schoolRenewalDate: string;
  newSchoolDueDate: string | null;
  currentSchoolTimeZoneId: string | null;
  requiresCalendarChangeAcknowledgment: boolean;
  canRenew: boolean;
  blockedReasons: string[];
  revision: string;
};
const changed = (_result: unknown, error: unknown) => (error ? [] : libraryCirculationMutationTags);
export const libraryLoansApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryLoan: builder.query<LibraryLoan, string>({
      query: (loanId) => `/library/circulation/loans/${loanId}`,
      providesTags: [libraryModuleType.bookIssue, libraryCalendarReadTag],
    }),
    returnLibraryLoan: builder.mutation<
      LibraryLoanCommandResult,
      { loanId: string; body: LibraryLoanReturnRequest }
    >({
      query: ({ loanId, body }) => ({
        url: `/library/circulation/loans/${loanId}/return`,
        method: 'POST',
        body,
      }),
      invalidatesTags: changed,
    }),
    getLibraryRenewalPlan: builder.query<
      RenewalPlan,
      { loanId: string; body: LibraryRenewalPlanRequest }
    >({
      query: ({ loanId, body }) => ({
        url: `/library/circulation/loans/${loanId}/renewal-preview`,
        method: 'POST',
        body,
      }),
      providesTags: [libraryModuleType.bookIssue, libraryCalendarReadTag],
    }),
    renewLibraryLoan: builder.mutation<
      LibraryLoanCommandResult,
      { loanId: string; body: LibraryRenewRequest }
    >({
      query: ({ loanId, body }) => ({
        url: `/library/circulation/loans/${loanId}/renew`,
        method: 'POST',
        body,
      }),
      invalidatesTags: changed,
    }),
    reviewLibraryLoanDates: builder.mutation<
      LibraryLoanCommandResult,
      { loanId: string; body: LibraryLoanDateReviewRequest }
    >({
      query: ({ loanId, body }) => ({
        url: `/library/circulation/loans/${loanId}/dates/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: changed,
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetLibraryLoanQuery,
  useLazyGetLibraryLoanQuery,
  useReturnLibraryLoanMutation,
  useGetLibraryRenewalPlanQuery,
  useLazyGetLibraryRenewalPlanQuery,
  useRenewLibraryLoanMutation,
  useReviewLibraryLoanDatesMutation,
} = libraryLoansApi;
