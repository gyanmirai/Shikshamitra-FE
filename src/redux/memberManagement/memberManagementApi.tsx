import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import memberManagementData from 'src/json/library/memberManagementData.json';

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
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: [
    'MemberManagement',
    'MemberOptions',
    'RoleOptions',
    'ClassOptions',
    'DivisionOptions',
    'StudentOptions',
    'StatusOptions',
    'BookCategoryOptions',
    'BookTitleOptions',
  ],
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: () => ({
        url: '/memberManagementData',
        method: 'GET',
      }),
      providesTags: ['MemberManagement'],
    }),
    getMemberOptions: builder.query({
      query: () => ({
        url: '/memberManagementOptions',
        method: 'GET',
      }),
      providesTags: ['MemberOptions'],
    }),
    getRoleOptions: builder.query({
      query: () => ({
        url: '/roleOptions',
        method: 'GET',
      }),
      providesTags: ['RoleOptions'],
    }),
    getClassOptions: builder.query({
      query: () => ({
        url: '/classOptions',
        method: 'GET',
      }),
      providesTags: ['ClassOptions'],
    }),
    getDivisionOptions: builder.query({
      query: () => ({
        url: '/divisionOptions',
        method: 'GET',
      }),
      providesTags: ['DivisionOptions'],
    }),
    getStudentOptions: builder.query({
      query: () => ({
        url: '/studentOptions',
        method: 'GET',
      }),
      providesTags: ['StudentOptions'],
    }),
    getStatusOptions: builder.query({
      query: () => ({
        url: '/statusOptions',
        method: 'GET',
      }),
      providesTags: ['StatusOptions'],
    }),
    getBookCategoryOptions: builder.query({
      query: () => ({
        url: '/bookCategoryOptions',
        method: 'GET',
      }),
      providesTags: ['BookCategoryOptions'],
    }),
    getBookTitleOptions: builder.query({
      query: () => ({
        url: '/bookTitleOptions',
        method: 'GET',
      }),
      providesTags: ['BookTitleOptions'],
    }),
    getSelectStatusOptions: builder.query({
      query: () => ({
        url: '/selectStatusOptions',
        method: 'GET',
      }),
      providesTags: ['StatusOptions'],
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
} = memberManagementApi;
