import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const assignmentTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all assignment types under academic medium
    getAssignmentTypes: builder.query({
      query: ({ academicMediumId }: { academicMediumId: string }) => ({
        url: `/assignment-type`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.assignmentType],
    }),

    // Get specific assignment type by ID
    getAssignmentTypeById: builder.query({
      query: ({ id }: { id: string }) => ({
        url: `/assignment-type/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.assignmentType],
    }),

    // Add new assignment type
    addAssignmentType: builder.mutation({
      query: ({
        academicMediumId,
        data,
      }: {
        academicMediumId: string;
        data: {
          assignmentTypeName: string;
          description?: string;
          defaultSubmissionType?: number;
          defaultMarks?: number;
          defaultDueDays?: number;
          evaluationRequired?: boolean;
          defaultEvaluationMethod?: number;
          status?: number;
        };
      }) => ({
        url: `/assignment-type`,
        method: 'POST',
        body: data,
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.assignmentType],
    }),

    // Update assignment type
    updateAssignmentType: builder.mutation({
      query: ({
        assignmentTypeId,
        academicMediumId,
        data,
      }: {
        assignmentTypeId: string;
        academicMediumId: string;
        data: {
          assignmentTypeName: string;
          description?: string;
          defaultSubmissionType?: number;
          defaultMarks?: number;
          defaultDueDays?: number;
          evaluationRequired?: boolean;
          defaultEvaluationMethod?: number;
          status?: number;
        };
      }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'PUT',
        body: data,
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.assignmentType],
    }),

    // Delete assignment type
    deleteAssignmentType: builder.mutation({
      query: ({
        assignmentTypeId,
        academicMediumId,
      }: {
        assignmentTypeId: string;
        academicMediumId: string;
      }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.assignmentType],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetAssignmentTypesQuery,
  useGetAssignmentTypeByIdQuery,
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
  useDeleteAssignmentTypeMutation,
} = assignmentTypesApi;
