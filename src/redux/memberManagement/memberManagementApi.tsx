import { memberManagementType } from 'src/redux/tagTypes';

import { api } from '../service';

export const memberManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: () => ({
        url: '/memberManagementData',
        method: 'GET',
      }),
      providesTags: [memberManagementType.memberManagement],
    }),
    getMemberOptions: builder.query({
      query: () => ({
        url: '/memberManagementOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.memberOptions],
    }),
    getRoleOptions: builder.query({
      query: () => ({
        url: '/roleOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.roleOptions],
    }),
    getClassOptions: builder.query({
      query: () => ({
        url: '/classOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.classOptions],
    }),
    getDivisionOptions: builder.query({
      query: () => ({
        url: '/divisionOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.divisionOptions],
    }),
    getStudentOptions: builder.query({
      query: () => ({
        url: '/studentOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.studentOptions],
    }),
    getStatusOptions: builder.query({
      query: () => ({
        url: '/statusOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.statusOptions],
    }),
    getBookCategoryOptions: builder.query({
      query: () => ({
        url: '/bookCategoryOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.bookCategoryOptions],
    }),
    getBookTitleOptions: builder.query({
      query: () => ({
        url: '/bookTitleOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.bookTitleOptions],
    }),
    getSelectStatusOptions: builder.query({
      query: () => ({
        url: '/selectStatusOptions',
        method: 'GET',
      }),
      providesTags: [memberManagementType.statusOptions],
    }),
    getIssuedBooks: builder.query({
      query: () => ({
        url: '/mockIssuedBooks',
        method: 'GET',
      }),
      providesTags: [memberManagementType.memberManagement],
    }),
    getReservedBooks: builder.query({
      query: () => ({
        url: '/mockReservedBooks',
        method: 'GET',
      }),
      providesTags: [memberManagementType.memberManagement],
    }),
    getFinesCharges: builder.query({
      query: () => ({
        url: '/mockFinesCharges',
        method: 'GET',
      }),
      providesTags: [memberManagementType.memberManagement],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberOptionsQuery,
  useGetRoleOptionsQuery,
  useGetClassOptionsQuery,
  useGetDivisionOptionsQuery,
  useGetStudentOptionsQuery,
  useGetStatusOptionsQuery,
  useGetBookCategoryOptionsQuery,
  useGetBookTitleOptionsQuery,
  useGetSelectStatusOptionsQuery,
  useGetIssuedBooksQuery,
  useGetReservedBooksQuery,
  useGetFinesChargesQuery,
} = memberManagementApi;
