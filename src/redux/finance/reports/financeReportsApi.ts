import { financeModuleApi } from '../financeModuleApi';

export type FinanceReportFormat = 'pdf' | 'excel';

export type FinanceReportFilter = {
  academicYearIds?: string[];
  months?: number[];
  batchId?: string;
  receiptBookIds?: string[];
  feeHeadIds?: string[];
  boardId?: string;
  mediumId?: string;
  organizationIds?: string[];
  classIds?: string[];
  divisionIds?: string[];
  fromDate?: string;
  toDate?: string;
};

export type FinanceReportRequest = {
  reportType: string;
  format: FinanceReportFormat;
  page?: number;
  pageSize?: number;
  filters: FinanceReportFilter;
};

export type FinanceReportPreview = {
  reportType: string;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: { id: string; label: string }[];
  rows: Record<string, string | null>[];
  normalizedFilters: FinanceReportFilter;
};

export type FinanceAiClarificationAnswer = { question: string; answer: string };
export type FinanceAiClarificationQuestion = {
  id: string;
  question: string;
  options: string[];
  recommendedOption: string;
};

export type FinanceAiPlanResponse = {
  status: 'NeedsClarification' | 'Ready';
  plan?: FinanceReportRequest;
  interpretedRequest: string;
  summary: string;
  clarificationQuestions: FinanceAiClarificationQuestion[];
  assumptions: string[];
  confidence: number;
  permissionSummary: string;
};

export const normalizeFinanceReportRequest = (
  request: FinanceReportRequest,
  pageSize: number
): FinanceReportRequest => ({
  ...request,
  page: 1,
  pageSize,
  filters: request.filters ?? {},
});

export const financeReportsApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    createFinanceAiPlan: builder.mutation<
      FinanceAiPlanResponse,
      { prompt: string; clarificationAnswers: FinanceAiClarificationAnswer[] }
    >({
      query: (body) => ({ url: '/app/finance-report/ai/plan', method: 'POST', body }),
    }),
    previewFinanceReport: builder.mutation<FinanceReportPreview, FinanceReportRequest>({
      query: (body) => ({
        url: '/app/finance-report/preview',
        method: 'POST',
        body: normalizeFinanceReportRequest(body, 5),
      }),
    }),
    createFinanceReportExport: builder.mutation<
      { jobId: string; status: string },
      FinanceReportRequest
    >({
      query: (body) => ({
        url: '/app/finance-report/exports',
        method: 'POST',
        body: normalizeFinanceReportRequest(body, 50),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateFinanceAiPlanMutation,
  usePreviewFinanceReportMutation,
  useCreateFinanceReportExportMutation,
} = financeReportsApi;
