import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import { memberManagementType } from 'src/redux/tagTypes';

import memberManagementData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const memberManagementApi = createApi({
  reducerPath: 'MemberManagementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/memberManagementData') {
          return { data: memberManagementData.memberManagementData };
        }
        if (url === '/roleOptions') {
          return { data: memberManagementData.roleOptions };
        }
        if (url === '/classOptions') {
          return { data: memberManagementData.classOptions };
        }
        if (url === '/divisionOptions') {
          return { data: memberManagementData.divisionOptions };
        }
        if (url === '/studentOptions') {
          return { data: memberManagementData.studentOptions };
        }
        if (url === '/statusOptions') {
          return { data: memberManagementData.statusOptions };
        }
        if (url === '/bookCategoryOptions') {
          return { data: memberManagementData.bookCategoryOptions };
        }
        if (url === '/bookTitleOptions') {
          return { data: memberManagementData.bookTitleOptions };
        }
        if (url === '/selectStatusOptions') {
          return { data: memberManagementData.selectStatusOptions };
        }
        if (url === '/mockIssuedBooks') {
          return { data: memberManagementData.mockIssuedBooks };
        }
        if (url === '/mockReservedBooks') {
          return { data: memberManagementData.mockReservedBooks };
        }
        if (url === '/mockFinesCharges') {
          return { data: memberManagementData.mockFinesCharges };
        }
        // Return 404 for unknown routes
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: [
    memberManagementType.memberManagement,
    memberManagementType.memberOptions,
    memberManagementType.roleOptions,
    memberManagementType.classOptions,
    memberManagementType.divisionOptions,
    memberManagementType.studentOptions,
    memberManagementType.statusOptions,
    memberManagementType.bookCategoryOptions,
    memberManagementType.bookTitleOptions,
  ],
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
