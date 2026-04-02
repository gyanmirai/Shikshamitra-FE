import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const gradeScalingApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all grade scalings under academic medium
    getGradeScalings: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academics/examination/settings/grading-scales`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.gradeScaling],
    }),

    // Get specific grade scaling under academic medium
    getGradeScalingById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.gradeScaling],
    }),

    // Add new grade scaling under medium
    addGradeScaling: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academics/examination/settings/grading-scales`,
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [academicType.gradeScaling],
    }),

    // Update grade scaling in medium
    updateGradeScaling: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [academicType.gradeScaling],
    }),

    // Delete grade scaling under medium
    deleteGradeScaling: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.gradeScaling],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetGradeScalingsQuery,
  useGetGradeScalingByIdQuery,
  useAddGradeScalingMutation,
  useUpdateGradeScalingMutation,
  useDeleteGradeScalingMutation,
} = gradeScalingApi;
