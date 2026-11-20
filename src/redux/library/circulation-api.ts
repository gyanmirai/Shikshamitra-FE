import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryCirculationMutationTags } from './library-cache-tags';
import { libraryPolicyReadTag, libraryCalendarReadTag } from './operational-settings-tags';

import type { LibraryCheckoutRequest } from './circulation-commands';
import type {
  LibraryIssuePlan,
  LibraryCopyLookup,
  LibraryReturnLookup,
  LibraryIssuePlanRequest,
  LibraryLoanCommandResult,
} from './circulation-types';

export const libraryCirculationApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCirculationCopy: builder.query<LibraryCopyLookup, { scan: string }>({
      query: (params) => ({ url: '/library/circulation/lookups/copy', params }),
      providesTags: [
        libraryModuleType.books,
        libraryModuleType.copies,
        librarySettingsType.librarySettings,
        libraryCalendarReadTag,
      ],
    }),
    getCirculationReturn: builder.query<LibraryReturnLookup, { scan: string }>({
      query: (params) => ({ url: '/library/circulation/lookups/return', params }),
      providesTags: [
        libraryModuleType.books,
        libraryModuleType.copies,
        libraryModuleType.bookIssue,
        librarySettingsType.librarySettings,
        libraryCalendarReadTag,
      ],
    }),
    getCirculationIssuePlan: builder.query<LibraryIssuePlan, LibraryIssuePlanRequest>({
      query: (body) => ({ url: '/library/circulation/issues/preview', method: 'POST', body }),
      providesTags: [
        libraryModuleType.copies,
        libraryModuleType.members,
        libraryModuleType.bookIssue,
        librarySettingsType.librarySettings,
        libraryCalendarReadTag,
        libraryPolicyReadTag,
      ],
    }),
    checkoutLibraryLoan: builder.mutation<LibraryLoanCommandResult, LibraryCheckoutRequest>({
      query: (body) => ({ url: '/library/circulation/loans', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : libraryCirculationMutationTags),
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetCirculationCopyQuery,
  useGetCirculationReturnQuery,
  useLazyGetCirculationReturnQuery,
  useGetCirculationIssuePlanQuery,
  useCheckoutLibraryLoanMutation,
} = libraryCirculationApi;
