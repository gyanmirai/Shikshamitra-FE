import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const subjectsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subjects under academic medium
    getCoreSubjectsByMedium: builder.query({
      query: ({ academicMediumId, searchTerm, includeArchived = false }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'GET',
        params: { searchTerm, includeArchived },
      }),
      providesTags: [academicType.subject],
    }),

    // Get specific subject under academic medium
    getSubjectById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.subject],
    }),

    // Add new subject under medium
    addSubject: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    bulkAddSubjects: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/bulk`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    // Update subject in medium
    updateSubject: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    // Delete subject under medium
    deleteSubject: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.subject],
    }),

    archiveSubject: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.subject],
    }),

    restoreSubject: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.subject],
    }),

    checkSubjectDuplicate: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/check-duplicate`,
        method: 'POST',
        body,
      }),
    }),

    getSubjectUsage: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}/usage`,
        method: 'GET',
      }),
      providesTags: [academicType.subject],
    }),

    getSubjectAuditLogs: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects/${id}/audit-logs`,
        method: 'GET',
      }),
      providesTags: [academicType.subject],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetCoreSubjectsByMediumQuery,
  useGetSubjectByIdQuery,
  useAddSubjectMutation,
  useBulkAddSubjectsMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useArchiveSubjectMutation,
  useRestoreSubjectMutation,
  useCheckSubjectDuplicateMutation,
  useGetSubjectUsageQuery,
  useGetSubjectAuditLogsQuery,
} = subjectsApi;
