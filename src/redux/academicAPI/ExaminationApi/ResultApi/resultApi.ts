import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const examResultApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Readiness Check ────────────────────────────────────────────────────
    getResultReadiness: builder.query({
      query: ({ examId, divisionId }: { examId: string; divisionId: string }) => ({
        url: `/academics/results/readiness`,
        method: 'GET',
        params: { examId, divisionId },
      }),
      providesTags: (result, error, arg) => [
        { type: academicType.examResult, id: `readiness-${arg.examId}-${arg.divisionId}` },
      ],
    }),

    // ─── Get Header (check if result already generated) ─────────────────────
    getResultHeader: builder.query({
      query: ({ examId, divisionId }: { examId: string; divisionId: string }) => ({
        url: `/academics/results`,
        method: 'GET',
        params: { examId, divisionId },
      }),
      providesTags: (result, error, arg) => [
        { type: academicType.examResult, id: `header-${arg.examId}-${arg.divisionId}` },
      ],
    }),

    // ─── Analytics ──────────────────────────────────────────────────────────
    getResultAnalytics: builder.query({
      query: ({ resultHeaderId }: { resultHeaderId: string }) => ({
        url: `/academics/results/analytics`,
        method: 'GET',
        params: { resultHeaderId },
      }),
      providesTags: (result, error, arg) => [
        { type: academicType.examResult, id: `analytics-${arg.resultHeaderId}` },
      ],
    }),

    // ─── Generate ───────────────────────────────────────────────────────────
    generateResult: builder.mutation({
      query: (body: { examId: string; divisionId: string; forceRegenerate?: boolean }) => ({
        url: `/academics/results/generate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.examResult],
    }),

    // ─── Publish ────────────────────────────────────────────────────────────
    publishResult: builder.mutation({
      query: (body: { resultHeaderId: string }) => ({
        url: `/academics/results/publish`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.examResult],
    }),

    // ─── Freeze ─────────────────────────────────────────────────────────────
    freezeResult: builder.mutation({
      query: (body: { resultHeaderId: string; remarks?: string }) => ({
        url: `/academics/results/freeze`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.examResult],
    }),

    // ─── View Student Result Details ───────────────────────────────────────
    getStudentResultDetails: builder.query({
      query: ({ examId, studentId }: { examId: string; studentId: string }) => ({
        url: `/academics/results/student-details`,
        method: 'GET',
        params: { examId, studentId },
      }),
      providesTags: (result, error, arg) => [
        { type: academicType.examResult, id: `details-${arg.examId}-${arg.studentId}` },
      ],
    }),
  }),
});

export const {
  useGetResultReadinessQuery,
  useGetResultHeaderQuery,
  useGetResultAnalyticsQuery,
  useGenerateResultMutation,
  usePublishResultMutation,
  useFreezeResultMutation,
  useGetStudentResultDetailsQuery,
} = examResultApi;
