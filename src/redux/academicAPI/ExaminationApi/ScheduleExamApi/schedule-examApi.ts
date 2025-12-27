import { academicApi } from '../../academicApi';

export const scheduleExamApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Basic Details
    addExamBasicDetails: builder.mutation({
      query: ({ body }) => ({
        url: `exams/basic-details`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    updateExamBasicDetails: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/basic-details`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    getExamBasicDetails: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/basic-details`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Exam', id: arg.examId }],
    }),

    // Step 2: Exam Schedule
    getExamSchedule: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/schedule`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Exam', id: arg.examId }],
    }),

    updateExamSchedule: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/schedule`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Step 3: Room Assignment
    getExamRoomAssignments: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/rooms`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Exam', id: arg.examId }],
    }),

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

    // Get Subjects of Exam
    getExamSubjects: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/subjects`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Exam', id: arg.examId }],
    }),

    // Delete Exam
    deleteExam: builder.mutation({
      query: ({ examId }) => ({
        url: `exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exam'],
    }),

    publishExam: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/publish`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddExamBasicDetailsMutation,
  useUpdateExamBasicDetailsMutation,
  useGetExamBasicDetailsQuery,
  useGetExamScheduleQuery,
  useUpdateExamScheduleMutation,
  useGetExamRoomAssignmentsQuery,
  useUpdateExamRoomAssignmentMutation,
  useGetExamsQuery,
  useGetExamSubjectsQuery,
  useDeleteExamMutation,
  usePublishExamMutation,
} = scheduleExamApi;
