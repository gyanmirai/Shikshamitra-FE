import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import { librarySettingsType } from 'src/redux/tagTypes';

export const librarySettingsApi = createApi({
  reducerPath: 'LibrarySettingsApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  }),
  tagTypes: [librarySettingsType.librarySettings],
  endpoints: (builder) => ({
    getLibrarySettings: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/sections',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),

    getBookCategory: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/api/library/charge-categories',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
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
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    updateChargeCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/api/library/charge-categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    deleteChargeCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/api/library/charge-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    getLibraryTiming: builder.query({
      query: (params) => ({
        url: '/api/library-hours',
        method: 'GET',
        params,
      }),
      providesTags: [librarySettingsType.librarySettings],
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
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    getBorrowingReturnRules: builder.query({
      query: (params) => ({
        url: `/api/borrowing-rules`,
        method: 'GET',
        params,
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    addBorrowingReturnRules: builder.mutation({
      query: ({ data, academicYearId }) => ({
        url: `/api/borrowing-rules`,
        method: 'POST',
        data,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    getSectionManagement: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: `/api/library/sections`,
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    getSectionManagementById: builder.query({
      query: ({ sectionId, academicYearId }) => ({
        url: `/api/library/sections/${sectionId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    addSectionManagement: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/api/library/sections`,
        method: 'POST',
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    updateSectionManagement: builder.mutation({
      query: ({ data, sectionId, academicYearId }) => ({
        url: `/api/library/sections/${sectionId}`,
        method: 'PUT',
        data,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    deleteSectionManagement: builder.mutation({
      query: ({ sectionId }) => ({
        url: `/library/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
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
