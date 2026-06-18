import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { mapLibraryMemberDto, toLibraryPaginatedList } from '../library-adapters';

export const memberManagementApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryMembers: builder.query({
      query: (params) => ({
        url: '/library/members',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapLibraryMemberDto),
      providesTags: [libraryModuleType.members],
    }),

    getMemberDetails: builder.query({
      query: ({ memberId }) => ({
        url: `/library/members/${memberId}`,
        method: 'GET',
      }),
      transformResponse: mapLibraryMemberDto,
      providesTags: (result, error, { memberId }) => [
        { type: libraryModuleType.members, id: memberId },
      ],
    }),

    getMemberBorrowedBooks: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrowed-books`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response),
    }),

    getMemberReservedBooks: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/reserved-books`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response),
    }),

    getMemberCharges: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/charges`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response),
    }),

    getMemberBorrowHistory: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrow-history`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryMembersQuery,
  useGetMemberDetailsQuery,
  useGetMemberBorrowedBooksQuery,
  useGetMemberReservedBooksQuery,
  useGetMemberChargesQuery,
  useGetMemberBorrowHistoryQuery,
} = memberManagementApi;
