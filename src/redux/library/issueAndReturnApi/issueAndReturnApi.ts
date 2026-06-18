import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
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
      providesTags: [libraryModuleType.books],
    }),

    getBookDetailsByAccession: builder.query({
      query: ({ accessionNo }) => ({
        url: `/library/books/accession/${accessionNo}`,
        method: 'GET',
      }),
    }),

    issueBook: builder.mutation({
      query: ({ body }) => ({
        url: '/library/issues',
        method: 'POST',
        body,
      }),
      invalidatesTags: [libraryModuleType.books],
    }),

    getReturnDetails: builder.query({
      query: ({ accessionNo }) => ({
        url: `/library/returns/search`,
        method: 'GET',
        params: { accessionNo },
      }),
      transformResponse: mapReturnSearchDto,
    }),

    returnBook: builder.mutation({
      query: ({ body }) => ({
        url: '/library/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: [libraryModuleType.books],
    }),

    getMemberDetailsByAccession: builder.query({
      query: ({ accessionNo, ...params }) => ({
        url: `/library/issuedBook/accession/${accessionNo}/member`,
        method: 'GET',
        params,
      }),
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
