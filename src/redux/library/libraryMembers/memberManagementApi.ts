import { libraryModuleApi } from '../libraryModuleApi';

export const memberManagementApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: (params) => ({
        url: '/library/members',
        method: 'GET',
        params,
      }),
      providesTags: ['Members'],
    }),

    getMemberDetails: builder.query({
      query: ({ memberId, academicYearId }) => ({
        url: `/library/members/${memberId}/details`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: (result, error, { memberId }) => [{ type: 'Members', id: memberId }],
    }),

    getMemberBorrowedBooks: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrowed`,
        method: 'GET',
        params,
      }),
    }),

    getMemberReservedBooks: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/reserved`,
        method: 'GET',
        params,
      }),
    }),

    getMemberCharges: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/charges`,
        method: 'GET',
        params,
      }),
    }),

    getMemberBorrowHistory: builder.query({
      query: ({ memberId, ...params }) => ({
        url: `/library/members/${memberId}/borrow-history`,
        method: 'GET',
        params,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMembersQuery,
  useGetMemberDetailsQuery,
  useGetMemberBorrowedBooksQuery,
  useGetMemberReservedBooksQuery,
  useGetMemberChargesQuery,
  useGetMemberBorrowHistoryQuery,
} = memberManagementApi;
