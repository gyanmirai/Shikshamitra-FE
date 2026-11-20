import { libraryChargeType, libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { mapMemberBookRecord } from './member-record-types';
import { libraryCalendarReadTag } from '../operational-settings-tags';
import { mapLibraryMemberDto, toLibraryPaginatedList } from '../library-adapters';

import type { MemberChargePage, MemberChargeRecord } from './member-charge-types';
import type { MemberRecordPage, MemberRecordPageParams } from './member-record-types';

export const memberManagementApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryMembers: builder.query({
      query: (params) => ({
        url: '/library/members',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapLibraryMemberDto),
      providesTags: [libraryModuleType.members, libraryCalendarReadTag],
    }),

    getMemberDetails: builder.query({
      query: ({ memberId }) => ({
        url: `/library/members/${memberId}`,
        method: 'GET',
      }),
      transformResponse: mapLibraryMemberDto,
      providesTags: (result, error, { memberId }) => [
        { type: libraryModuleType.members, id: memberId },
        libraryCalendarReadTag,
      ],
    }),

    getMemberBorrowedBooks: builder.query<MemberRecordPage, MemberRecordPageParams>({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrowed-books`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapMemberBookRecord),
      providesTags: (_result, _error, { memberId }) => [
        libraryModuleType.bookIssue,
        libraryModuleType.books,
        { type: libraryModuleType.members, id: memberId },
      ],
    }),

    getMemberReservedBooks: builder.query<MemberRecordPage, MemberRecordPageParams>({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/reserved-books`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapMemberBookRecord),
      providesTags: (_result, _error, { memberId }) => [
        libraryModuleType.bookReservation,
        libraryModuleType.books,
        { type: libraryModuleType.members, id: memberId },
      ],
    }),

    getMemberCharges: builder.query<MemberChargePage, MemberRecordPageParams>({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/charges`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList<MemberChargeRecord>(response),
      providesTags: (_result, _error, { memberId }) => [
        libraryModuleType.memberCharges,
        libraryChargeType.libraryCharge,
        { type: libraryModuleType.members, id: memberId },
      ],
    }),

    getMemberBorrowHistory: builder.query<MemberRecordPage, MemberRecordPageParams>({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrow-history`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapMemberBookRecord),
      providesTags: (_result, _error, { memberId }) => [
        libraryModuleType.borrowHistory,
        libraryModuleType.books,
        { type: libraryModuleType.members, id: memberId },
      ],
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
