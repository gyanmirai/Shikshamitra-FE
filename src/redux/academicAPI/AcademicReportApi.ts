import { academicType } from 'src/redux/tagTypes';

import { api } from '../service';

export type AcademicAiReportModule =
  | 'Curriculum'
  | 'Timetable'
  | 'Homework & Assignment'
  | 'Examination'
  | 'Student Records'
  | 'Student Attendance';

export interface AcademicAiReportExportRequest {
  prompt: string;
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  module: AcademicAiReportModule;
  plan: AcademicDynamicReportSpec;
  approvalToken: string;
}

export interface AcademicAiReportPlanRequest {
  prompt: string;
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  module: AcademicAiReportModule;
  clarificationAnswers: AcademicAiReportClarificationAnswer[];
}

export interface AcademicAiReportClarificationAnswer {
  question: string;
  answer: string;
}

export interface AcademicAiReportClarificationQuestion {
  id: string;
  question: string;
  options: string[];
  recommendedOption: string;
}

export interface AcademicDynamicReportFilter {
  classTokens: string[];
  divisionTokens: string[];
  subjectTokens: string[];
  chapterTokens: string[];
}

export interface AcademicDynamicReportSort {
  field: string;
  direction: 'ascending' | 'descending';
}

export interface AcademicDynamicReportCondition {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'contains'
    | 'startsWith'
    | 'in'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'between'
    | 'isEmpty'
    | 'isNotEmpty';
  values: string[];
}

export interface AcademicDynamicReportAppliedFilter {
  type: 'class' | 'division' | 'subject' | 'chapter';
  label: string;
  values: string[];
}

export interface AcademicDynamicReportSpec {
  module: AcademicAiReportModule;
  dataset:
    | 'curriculum.subjects'
    | 'curriculum.chapters'
    | 'curriculum.teachers'
    | 'timetable.slots'
    | 'student-records.students'
    | 'student-attendance.entries'
    | 'student-attendance.daily-summary'
    | 'homework-assignment.homework'
    | 'homework-assignment.assignments'
    | 'examination.schedule'
    | 'examination.marks'
    | 'examination.results';
  title: string;
  summary: string;
  interpretedRequest: string;
  requestedFilterTypes: Array<'class' | 'division' | 'subject' | 'chapter'>;
  appliedFilters: AcademicDynamicReportAppliedFilter[];
  columns: string[];
  filters: AcademicDynamicReportFilter;
  where: {
    match: 'all' | 'any';
    conditions: AcademicDynamicReportCondition[];
  };
  sort: AcademicDynamicReportSort[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface AcademicAiReportPlanResponse {
  status: 'NeedsClarification' | 'Ready';
  plan?: AcademicDynamicReportSpec | null;
  clarificationQuestions: AcademicAiReportClarificationQuestion[];
  assumptions: string[];
  confidence: number;
  permissionSummary: string;
  approvalToken?: string | null;
}

export interface AcademicAiReportPreviewRequest {
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  module: AcademicAiReportModule;
  plan: AcademicDynamicReportSpec;
}

export interface AcademicReportPreview {
  reportType: string;
  generatedAtUtc: string;
  filterSummary: string;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: Array<{ id: string; label: string }>;
  rows: Array<Record<string, string | null>>;
}

export interface AcademicAiReportPreviewResponse {
  plan: AcademicDynamicReportSpec;
  preview: AcademicReportPreview;
  permissionSummary: string;
  approvalToken: string;
}

export interface AcademicAiReportExportResponse {
  jobId: string;
  status: string;
  reportType: string;
  summary: string;
  plan: AcademicDynamicReportSpec;
}

export interface AcademicReportExportJobResponse {
  id: string;
  reportType: string;
  status: string;
  fileName?: string | null;
  errorMessage?: string | null;
  isDynamic: boolean;
  module?: string | null;
}

export interface AcademicReportDownloadResponse {
  blob: Blob;
  bytes?: string;
  contentType?: string | null;
  fileName?: string | null;
}

function getDownloadFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  const encodedFileName = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)?.[1];
  if (encodedFileName) {
    try {
      return decodeURIComponent(encodedFileName);
    } catch {
      return encodedFileName;
    }
  }

  return (
    /filename="([^"]+)"/i.exec(contentDisposition)?.[1] ||
    /filename=([^;]+)/i.exec(contentDisposition)?.[1]?.trim() ||
    null
  );
}

export const academicReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/app/academic-report/options
    getAcademicReportOptions: builder.query({
      query: () => ({
        url: '/app/academic-report/options',
        method: 'GET',
      }),
      providesTags: [academicType.academicReport],
    }),

    // POST /api/app/academic-report/preview
    previewAcademicReport: builder.mutation({
      query: (body) => ({
        url: '/app/academic-report/preview',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/app/academic-report/exports
    createAcademicReportExport: builder.mutation({
      query: (body) => ({
        url: '/app/academic-report/exports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.academicReportExport],
    }),

    // POST /api/app/academic-report/ai/plan
    createAcademicReportAiPlan: builder.mutation<
      AcademicAiReportPlanResponse,
      AcademicAiReportPlanRequest
    >({
      query: (body) => ({
        url: '/app/academic-report/ai/plan',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/app/academic-report/ai/preview
    createAcademicReportAiPreview: builder.mutation<
      AcademicAiReportPreviewResponse,
      AcademicAiReportPreviewRequest
    >({
      query: (body) => ({
        url: '/app/academic-report/ai/preview',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/app/academic-report/ai/exports
    createAcademicReportAiExport: builder.mutation<
      AcademicAiReportExportResponse,
      AcademicAiReportExportRequest
    >({
      query: (body) => ({
        url: '/app/academic-report/ai/exports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.academicReportExport],
    }),

    // GET /api/app/academic-report/exports
    getAcademicReportExports: builder.query({
      query: () => ({
        url: '/app/academic-report/exports',
        method: 'GET',
      }),
      providesTags: [academicType.academicReportExport],
    }),

    // GET /api/app/academic-report/exports/{jobId}
    getAcademicReportExportJob: builder.query<AcademicReportExportJobResponse, { jobId: string }>({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/academic-report/exports/${jobId}`,
        method: 'GET',
      }),
    }),

    // GET /api/app/academic-report/exports/{jobId}/download
    downloadAcademicReport: builder.query<AcademicReportDownloadResponse, { jobId: string }>({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/academic-report/exports/${jobId}/download`,
        method: 'GET',
        responseHandler: async (response: Response) => {
          const blob = await response.blob();
          return {
            blob,
            contentType: response.headers.get('content-type'),
            fileName: getDownloadFileName(response.headers.get('content-disposition')),
          };
        },
      }),
    }),
  }),
  // Next.js Fast Refresh can evaluate this endpoint module more than once in development.
  // Replacing the identical endpoint definitions avoids noisy duplicate-injection errors.
  overrideExisting: true,
});

export const {
  useGetAcademicReportOptionsQuery,
  usePreviewAcademicReportMutation,
  useCreateAcademicReportExportMutation,
  useCreateAcademicReportAiPlanMutation,
  useCreateAcademicReportAiPreviewMutation,
  useCreateAcademicReportAiExportMutation,
  useGetAcademicReportExportsQuery,
  useGetAcademicReportExportJobQuery,
  useLazyGetAcademicReportExportJobQuery,
  useDownloadAcademicReportQuery,
  useLazyDownloadAcademicReportQuery,
} = academicReportApi;
