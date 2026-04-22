import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const scheduleExamApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Basic Details
    addExamBasicDetails: builder.mutation({
      query: ({ body }) => ({
        url: `/exams/basic-details`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    updateExamBasicDetails: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/basic-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    getExamBasicDetails: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/basic-details`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    // Step 2: Exam Schedule
    getExamSchedule: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/schedule`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    updateExamSchedule: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/schedule`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    // Step 3: Room Assignment
    getExamRoomAssignments: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/rooms`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    updateExamRoomAssignment: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/rooms`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    // Get All Exams
    getExams: builder.query({
      query: (params) => ({
        url: `exams`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.exam],
    }),

    // Get Subjects of Exam
    getExamSubjects: builder.query({
      query: ({ examId }) => ({
        url: `exams/${examId}/subjects`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    // Delete Exam
    deleteExam: builder.mutation({
      query: ({ examId }) => ({
        url: `exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.exam],
    }),

    publishExam: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/publish`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [academicType.exam],
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
