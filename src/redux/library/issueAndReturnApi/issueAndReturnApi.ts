import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { libraryCirculationMutationTags } from '../library-cache-tags';
import {
  mapReturnSearchDto,
  mapIssueReturnItemDto,
  toLibraryPaginatedList,
} from '../library-adapters';

export const issueAndReturnApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIssueReturnList: builder.query({
      query: (params) => ({
        url: '/library/issue-returns',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapIssueReturnItemDto),
      providesTags: [
        libraryModuleType.books,
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
      ],
    }),

    getBookDetailsByAccession: builder.query({
      query: ({ accessionNo }) => ({
        url: '/library/books/accession',
        method: 'GET',
        params: { accessionNo },
      }),
      providesTags: [libraryModuleType.books, libraryModuleType.copies],
    }),

    issueBook: builder.mutation({
      query: ({ body }) => ({
        url: '/library/issues',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryCirculationMutationTags),
    }),

    getReturnDetails: builder.query({
      query: ({ accessionNo }) => ({
        url: `/library/returns/search`,
        method: 'GET',
        params: { accessionNo },
      }),
      transformResponse: mapReturnSearchDto,
      providesTags: [
        libraryModuleType.bookReturn,
        libraryModuleType.copies,
        libraryModuleType.books,
        libraryModuleType.members,
      ],
    }),

    returnBook: builder.mutation({
      query: ({ body }) => ({
        url: '/library/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryCirculationMutationTags),
    }),

    getMemberDetailsByAccession: builder.query({
      query: ({ accessionNo, ...params }) => ({
        url: '/library/issuedBook/member',
        method: 'GET',
        params: { ...params, accessionNo },
      }),
      providesTags: [
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
        libraryModuleType.members,
      ],
    }),
  }),
});

export const {
  useGetIssueReturnListQuery,
  useGetBookDetailsByAccessionQuery,
  useIssueBookMutation,
  useGetReturnDetailsQuery,
  useReturnBookMutation,
  useGetMemberDetailsByAccessionQuery,
} = issueAndReturnApi;
