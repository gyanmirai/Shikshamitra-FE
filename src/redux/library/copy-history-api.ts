import type { LibraryLoanRow } from 'src/screens/library/circulation/loan-types';

import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';
import { mapCanonicalLoanRead } from './circulation-read-adapter';
import { libraryCalendarReadTag } from './operational-settings-tags';

import type { LibraryPaginatedList } from './library-adapters';
import type { LibraryLoanReadParams } from './circulation-read-types';

export const libraryCopyHistoryApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCopyHistory: builder.query<
      LibraryPaginatedList<LibraryLoanRow>,
      { bookId: string; copyId: string } & LibraryLoanReadParams
    >({
      query: ({ bookId, copyId, ...params }) => ({
        url: `/library/books/${bookId}/copies/${copyId}/history`,
        params,
      }),
      transformResponse: (response: unknown) =>
        toLibraryPaginatedList<LibraryLoanRow>(response, mapCanonicalLoanRead),
      providesTags: [
        libraryModuleType.books,
        libraryModuleType.copies,
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
        librarySettingsType.librarySettings,
        libraryCalendarReadTag,
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLibraryCopyHistoryQuery } = libraryCopyHistoryApi;
