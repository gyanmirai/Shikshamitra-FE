import type { LibraryLoanRow } from 'src/screens/library/circulation/loan-types';

import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';
import { mapCanonicalLoanRead } from './circulation-read-adapter';
import { libraryCalendarReadTag } from './operational-settings-tags';

import type { LibraryPaginatedList } from './library-adapters';
import type { LibraryLoanReadParams } from './circulation-read-types';

export const libraryCirculationReadApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryLoanPage: builder.query<LibraryPaginatedList<LibraryLoanRow>, LibraryLoanReadParams>({
      query: (params) => ({ url: '/library/circulation/loans', params }),
      transformResponse: (response: unknown) =>
        toLibraryPaginatedList<LibraryLoanRow>(response, mapCanonicalLoanRead),
      providesTags: [
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
        libraryModuleType.books,
        libraryModuleType.copies,
        libraryModuleType.members,
        librarySettingsType.librarySettings,
        libraryCalendarReadTag,
      ],
    }),
  }),
  overrideExisting: false,
});
export const { useGetLibraryLoanPageQuery } = libraryCirculationReadApi;
