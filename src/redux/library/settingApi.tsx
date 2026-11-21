import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { api } from '../service';

export const librarySettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibrarySettings: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/library/sections',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),

    getBookCategory: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: '/library/charge-categories',
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),

    addChargeCategory: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/library/charge-categories',
          method: 'POST',
          body,
          params: { academicYearId },
        };
      },
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    updateChargeCategory: builder.mutation({
      query: ({ categoryId, data, body }) => ({
        url: `/library/charge-categories/${categoryId}`,
        method: 'PUT',
        body: body ?? data,
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    deleteChargeCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/library/charge-categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    getLibraryTiming: builder.query({
      query: (params) => ({
        url: '/library/library-hours',
        method: 'GET',
        params,
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),

    addLibraryTiming: builder.mutation({
      query: (data) => {
        const { academicYearId, ...body } = data;
        return {
          url: '/library/library-hours',
          method: 'POST',
          body,
          params: { academicYearId },
        };
      },
      invalidatesTags: [librarySettingsType.librarySettings],
    }),

    getBorrowingReturnRules: builder.query({
      query: (params) => ({
        url: `/library/borrowing-rules`,
        method: 'GET',
        params,
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    addBorrowingReturnRules: builder.mutation({
      query: ({ data, body, academicYearId }) => ({
        url: `/library/borrowing-rules`,
        method: 'POST',
        body: body ?? data,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    getSectionManagement: builder.query({
      query: ({ academicYearId, ...params }) => ({
        url: `/library/sections`,
        method: 'GET',
        params: { academicYearId, ...params },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    getSectionManagementById: builder.query({
      query: ({ sectionId, academicYearId }) => ({
        url: `/library/sections/${sectionId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    getLibrarySectionCampusOptions: builder.query<
      { id: string; name: string; code: string }[],
      { academicYearId: string }
    >({
      query: (params) => ({ url: '/library/sections/campus-options', params }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    bindLibrarySectionCampus: builder.mutation<
      { campusId: string; campusName: string | null },
      { sectionId: string; academicYearId: string; campusId: string }
    >({
      query: ({ sectionId, academicYearId, campusId }) => ({
        url: `/library/sections/${encodeURIComponent(sectionId)}/campus`,
        method: 'PUT',
        params: { academicYearId },
        body: { campusId },
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : [librarySettingsType.librarySettings, libraryModuleType.copies],
    }),
    addSectionManagement: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/library/sections`,
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    updateSectionManagement: builder.mutation({
      query: ({ data, body, sectionId, academicYearId }) => ({
        url: `/library/sections/${sectionId}`,
        method: 'PUT',
        body: body ?? data,
        params: { academicYearId },
      }),
      invalidatesTags: [librarySettingsType.librarySettings],
    }),
    deleteSectionManagement: builder.mutation({
      query: ({ sectionId, academicYearId }) => ({
        url: `/library/sections/${sectionId}`,
        method: 'DELETE',
        params: { academicYearId },
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
  useGetLibrarySectionCampusOptionsQuery,
  useBindLibrarySectionCampusMutation,
  useAddSectionManagementMutation,
  useUpdateSectionManagementMutation,
  useDeleteSectionManagementMutation,
} = librarySettingsApi;
