import { academicApi } from '../../academicApi';

export const gradeScalingApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all grade scalings under academic medium
    getGradeScalings: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/grade-scaling/academicMediumId=${academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['GradeScaling'],
    }),

    // Get specific grade scaling under academic medium
    getGradeScalingById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/grade-scaling/${id}/academicMediumId=${academicMediumId}`,
        method: 'GET',
      }),
      providesTags: ['GradeScaling'],
    }),

    // Add new grade scaling under medium
    addGradeScaling: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/grade-scaling/academicMediumId=${academicMediumId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['GradeScaling'],
    }),

    // Update grade scaling in medium
    updateGradeScaling: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/grade-scaling/${id}/academicMediumId=${academicMediumId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['GradeScaling'],
    }),

    // Delete grade scaling under medium
    deleteGradeScaling: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/grade-scaling/${id}/academicMediumId=${academicMediumId}`,
        method: 'DELETE',
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
