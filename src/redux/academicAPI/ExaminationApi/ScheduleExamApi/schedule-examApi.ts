import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const scheduleExamApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Basic Details
    addExamBasicDetails: builder.mutation({
      query: ({ body }) => ({
        url: `/academics/exams/basic-details`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    updateExamBasicDetails: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/basic-details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    getExamBasicDetails: builder.query({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/basic-details`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    // Step 2: Exam Schedule
    getExamSchedule: builder.query({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/schedule`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    updateExamSchedule: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/schedule`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    // Step 3: Room Assignment
    getExamRoomAssignments: builder.query({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/rooms`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    updateExamRoomAssignment: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/rooms`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    // Get All Exams
    getExams: builder.query({
      query: (params) => ({
        url: `/academics/exams`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.exam],
    }),

    getQuestionPaperExamLookup: builder.query({
      query: (params) => ({
        url: `/academics/exams/question-paper-lookup`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.exam],
    }),

    getExamSubjectsLookup: builder.query<any[], { classId: string; divisionIds: string[] }>({
      query: ({ classId, divisionIds }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('classId', classId);
        (divisionIds || []).forEach((id) => {
          queryParams.append('divisionIds', id);
        });
        return {
          url: `/academics/exams/subjects-lookup?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [academicType.exam],
    }),

    // Get Subjects of Exam
    getExamSubjects: builder.query({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/subjects`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: academicType.exam, id: arg.examId }],
    }),

    // Delete Exam
    deleteExam: builder.mutation({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.exam],
    }),

    publishExam: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/publish`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [academicType.exam],
    }),

    // Update exam status (Publish Timetable)
    updateExamStatus: builder.mutation<void, { examId: string; body: { status: number } }>({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/status`,
        method: 'PUT',
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
  useLazyGetExamScheduleQuery,
  useUpdateExamScheduleMutation,
  useGetExamRoomAssignmentsQuery,
  useUpdateExamRoomAssignmentMutation,
  useGetExamsQuery,
  useGetQuestionPaperExamLookupQuery,
  useGetExamSubjectsLookupQuery,
  useGetExamSubjectsQuery,
  useDeleteExamMutation,
  usePublishExamMutation,
  useUpdateExamStatusMutation,
} = scheduleExamApi;
