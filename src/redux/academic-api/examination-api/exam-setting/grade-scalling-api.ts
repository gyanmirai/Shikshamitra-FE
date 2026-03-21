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
      providesTags: ['GradeScaling'],
    }),

    // Get specific grade scaling under academic medium
    getGradeScalingById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['GradeScaling'],
    }),

    // Add new grade scaling under medium
    addGradeScaling: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academics/examination/settings/grading-scales`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['GradeScaling'],
    }),

    // Update grade scaling in medium
    updateGradeScaling: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['GradeScaling'],
    }),

    // Delete grade scaling under medium
    deleteGradeScaling: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academics/examination/settings/grading-scales/${id}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: ['GradeScaling'],
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
