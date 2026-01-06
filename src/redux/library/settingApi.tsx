import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import settingsData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const librarySettingsApi = createApi({
  reducerPath: 'LibrarySettingsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/librarySettingsData') {
          return { data: settingsData.librarySettingsData };
        }
        if (url === '/libraryTimingData') {
          return { data: settingsData.libraryTimingData };
        }
        if (url === '/borrowingReturnRulesData') {
          return { data: settingsData.borrowingReturnRulesData };
        }
        if (url === '/sectionManagementData') {
          return { data: settingsData.sectionManagementData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['LibrarySettings'],
  endpoints: (builder) => ({
    getLibrarySettings: builder.query({
      query: () => ({
        url: '/library/settings/charge-categories',
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),

    addChargeCategory: builder.mutation({
      query: (data) => ({
        url: '/library/settings/charge-categories',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    updateChargeCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/library/settings/charge-categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    deleteChargeCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/library/settings/charge-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    getLibraryTiming: builder.query({
      query: () => ({
        url: '/library/settings/hours',
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),

    addLibraryTiming: builder.mutation({
      query: (data) => ({
        url: '/library/settings/hours',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    getBorrowingReturnRules: builder.query({
      query: (academicYearId) => ({
        url: `/library/settings/borrowing-rules${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
    addBorrowingReturnRules: builder.mutation({
      query: ({ data, academicYearId }) => ({
        url: `/library/settings/borrowing-rules${academicYearId}`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    getSectionManagement: builder.query({
      query: (academicYearId) => ({
        url: `/library/settings/sections${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
    getSectionManagementById: builder.query({
      query: (sectionId) => ({
        url: `/library/settings/sections${sectionId}`,
        method: 'GET',
      }),
      providesTags: ['LibrarySettings'],
    }),
    addSectionManagement: builder.mutation({
      query: ({ data, academicYearId }) => ({
        url: `/library/settings/sections${academicYearId}`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    updateSectionManagement: builder.mutation({
      query: ({ data, sectionId }) => ({
        url: `/library/settings/sections${sectionId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    deleteSectionManagement: builder.mutation({
      query: (sectionId) => ({
        url: `/library/settings/sections${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
  }),
});

export const {
  useGetLibrarySettingsQuery,
  useAddChargeCategoryMutation,
  useUpdateChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
  useAddLibraryTimingMutation,
  useGetLibraryTimingQuery,
  useAddBorrowingReturnRulesMutation,
  useGetBorrowingReturnRulesQuery,
  useGetSectionManagementQuery,
  useGetSectionManagementByIdQuery,
  useAddSectionManagementMutation,
  useUpdateSectionManagementMutation,
  useDeleteSectionManagementMutation,
} = librarySettingsApi;
