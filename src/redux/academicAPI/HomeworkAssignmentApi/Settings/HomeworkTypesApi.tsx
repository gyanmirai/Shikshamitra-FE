import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const homeworkTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all homework types under academic medium
    getHomeworkTypes: builder.query({
      query: ({ academicMediumId }: { academicMediumId: string }) => ({
        url: `/homework-type`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.homeworkType],
    }),

    // Get specific homework type by ID
    getHomeworkTypeById: builder.query({
      query: ({ academicMediumId, id }: { academicMediumId: string; id: string }) => ({
        url: `/homework-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: [academicType.homeworkType],
    }),

    // Add new homework type
    addHomeworkType: builder.mutation({
      query: ({
        data,
        academicMediumId,
      }: {
        data: {
          homeworkTypeName: string;
          description?: string;
          defaultSubmissionType?: number;
          defaultMarks?: number;
          defaultDueDays?: number;
          evaluationRequired?: boolean;
          defaultEvaluationMethod?: number;
          status?: number;
        };
        academicMediumId: string;
      }) => ({
        url: `/homework-type`,
        method: 'POST',
        data,
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.homeworkType],
    }),

    // Update homework type
    updateHomeworkType: builder.mutation({
      query: ({
        homeworkTypeId,
        homeworkTypeName,
        academicMediumId,
        description,
        defaultSubmissionType,
        defaultMarks,
        defaultDueDays,
        evaluationRequired,
        defaultEvaluationMethod,
        status,
      }: {
        homeworkTypeId: string;
        homeworkTypeName: string;
        academicMediumId: string;
        description?: string;
        defaultSubmissionType?: number;
        defaultMarks?: number;
        defaultDueDays?: number;
        evaluationRequired?: boolean;
        defaultEvaluationMethod?: number;
        status?: number;
      }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'PUT',
        data: {
          homeworkTypeName,
          description,
          defaultSubmissionType,
          defaultMarks,
          defaultDueDays,
          evaluationRequired,
          defaultEvaluationMethod,
          status,
        },
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.homeworkType],
    }),

    // Delete homework type
    deleteHomeworkType: builder.mutation({
      query: ({
        homeworkTypeId,
        academicMediumId,
      }: {
        homeworkTypeId: string;
        academicMediumId: string;
      }) => ({
        url: `/homework-type/${homeworkTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: [academicType.homeworkType],
    }),
  }),
  overrideExisting: true,
});

// RTK query hooks
export const {
  useGetHomeworkTypesQuery,
  useGetHomeworkTypeByIdQuery,
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
  useDeleteHomeworkTypeMutation,
} = homeworkTypesApi;
