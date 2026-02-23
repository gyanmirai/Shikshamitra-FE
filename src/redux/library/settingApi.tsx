import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const librarySettingsApi = createApi({
  reducerPath: 'LibrarySettingsApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  }),
  tagTypes: ['LibrarySettings'],
  endpoints: (builder) => ({
    getLibrarySettings: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/sections',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: ['LibrarySettings'],
    }),

    getBookCategory: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/api/library/charge-categories',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: ['LibrarySettings'],
    }),

    addChargeCategory: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/api/library/charge-categories',
          method: 'POST',
          data: body,
          params: { academicYearId },
        };
      },
      invalidatesTags: ['LibrarySettings'],
    }),

    updateChargeCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/api/library/charge-categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    deleteChargeCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/api/library/charge-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibrarySettings'],
    }),

    getLibraryTiming: builder.query({
      query: (params) => ({
        url: '/api/library-hours',
        method: 'GET',
        params,
      }),
      providesTags: ['LibrarySettings'],
    }),

    addLibraryTiming: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/api/library-hours',
          method: 'POST',
          data: body,
          params: { academicYearId },
        };
      },
      invalidatesTags: ['LibrarySettings'],
    }),

    getBorrowingReturnRules: builder.query({
      query: (params) => ({
        url: `/api/borrowing-rules`,
        method: 'GET',
        params,
      }),
      providesTags: ['LibrarySettings'],
    }),
    addBorrowingReturnRules: builder.mutation({
      query: ({ data, academicYearId }) => ({
        url: `/api/borrowing-rules`,
        method: 'POST',
        data,
        params: { academicYearId },
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    getSectionManagement: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: `/api/sections`,
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: ['LibrarySettings'],
    }),
    getSectionManagementById: builder.query({
      query: ({ sectionId, academicYearId }) => ({
        url: `/api/sections/${sectionId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: ['LibrarySettings'],
    }),
    addSectionManagement: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/api/sections`,
        method: 'POST',
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    updateSectionManagement: builder.mutation({
      query: ({ data, sectionId, academicYearId }) => ({
        url: `/api/sections/${sectionId}`,
        method: 'PUT',
        data,
        params: { academicYearId },
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
    deleteSectionManagement: builder.mutation({
      query: ({ sectionId }) => ({
        url: `/library/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibrarySettings'],
    }),
  }),
});

export const {
  useGetLibrarySettingsQuery,
  useGetBookCategoryQuery,
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
