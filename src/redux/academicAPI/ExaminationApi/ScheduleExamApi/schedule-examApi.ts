import { academicApi } from '../../academicApi';

export const scheduleExamApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Basic Details
    addExamBasicDetails: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `exams/basic-details`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Step 2: Exam Schedule
    updateExamSchedule: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/schedule`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Step 3: Room Assignment
    updateExamRoomAssignment: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/rooms`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Get All Exams
    getExams: builder.query({
      query: (params) => ({
        url: `exams`,
        method: 'GET',
        params,
      }),
      providesTags: ['Exam'],
    }),

    // Get Exam By ID
    getExamById: builder.query({
      query: ({ examId, academicMediumId }) => ({
        url: `exams/${examId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: (result, error, arg) => [{ type: 'Exam', id: arg.examId }],
    }),

    // Publish Exam
    publishExam: builder.mutation({
      query: ({ examId, academicMediumId, body }) => ({
        url: `exams/${examId}/publish`,
        method: 'PATCH',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Delete Exam
    deleteExam: builder.mutation({
      query: ({ examId, academicMediumId }) => ({
        url: `exams/${examId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: ['Exam'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddExamBasicDetailsMutation,
  useUpdateExamScheduleMutation,
  useUpdateExamRoomAssignmentMutation,
  useGetExamsQuery,
  useGetExamByIdQuery,
  usePublishExamMutation,
  useDeleteExamMutation,
} = scheduleExamApi;
