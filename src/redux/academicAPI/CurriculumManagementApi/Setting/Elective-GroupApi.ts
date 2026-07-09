import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const electiveGroupsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all elective groups under academic medium
    getElectiveGroups: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups`,
        method: 'GET',
      }),
      providesTags: [academicType.electiveGroup],
    }),

    // Get specific elective group under academic medium
    getElectiveGroupById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.electiveGroup],
    }),

    // Add new elective group under medium
    addElectiveGroup: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.electiveGroup],
    }),

    // Update elective group under medium
    updateElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.electiveGroup],
    }),

    // Delete elective group under medium
    deleteElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.electiveGroup],
    }),

    archiveElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.electiveGroup],
    }),

    restoreElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.electiveGroup],
    }),

    checkElectiveGroupDuplicate: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/check-duplicate`,
        method: 'POST',
        body,
      }),
    }),

    getElectiveGroupUsage: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}/usage`,
        method: 'GET',
      }),
      providesTags: [academicType.electiveGroup],
    }),

    getElectiveGroupAuditLogs: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}/audit-logs`,
        method: 'GET',
      }),
      providesTags: [academicType.electiveGroup],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetElectiveGroupsQuery,
  useGetElectiveGroupByIdQuery,
  useAddElectiveGroupMutation,
  useUpdateElectiveGroupMutation,
  useDeleteElectiveGroupMutation,
  useArchiveElectiveGroupMutation,
  useRestoreElectiveGroupMutation,
  useCheckElectiveGroupDuplicateMutation,
  useGetElectiveGroupUsageQuery,
  useGetElectiveGroupAuditLogsQuery,
} = electiveGroupsApi;
