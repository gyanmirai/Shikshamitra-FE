import { api } from '../service';
import { employeeType } from '../tagTypes';

import type {
  HrReportSort,
  HrReportField,
  HrReportSummary,
  HrReportChartPreview,
  HrReportChartDefinition,
  HrReportFilterCondition,
} from './hrReportsApi';

export type ReportColumn = { field: string; label: string; format: string };
export type ReportConditionGroup = {
  match: 'all' | 'any';
  conditions: HrReportFilterCondition[];
  groups: ReportConditionGroup[];
};
export type ReportDesign = {
  version: number;
  dataSource: string;
  layout: 'detail' | 'summary' | 'attendanceMatrix' | 'salaryComponents';
  columns: ReportColumn[];
  filters: ReportConditionGroup;
  sorts: HrReportSort[];
  groups: string[];
  summaries: HrReportSummary[];
  chart?: HrReportChartDefinition | null;
  parameters: string[];
  defaultPeriod: string;
  dateField: string;
  paperSize: 'A4' | 'A3';
  orientation: 'portrait' | 'landscape';
};
export type ReportParameters = {
  filterValues?: Record<string, { value?: string; values?: string[] }>;
  timeZone?: string;
  period: string;
  month?: string;
  fromDate?: string;
  toDate?: string;
  employeeIds: string[];
  departments: string[];
  academicYearId?: string;
  educationMediumStageId?: string;
  employeeGroup?: number;
  cycleId?: string;
  includeDrafts: boolean;
};
export type ReportDataset = {
  id: string;
  label: string;
  category: string;
  rowMeaning: string;
  fields: HrReportField[];
  layouts: ReportDesign['layout'][];
  parameters: string[];
  requiredParameters: string[];
  summaryFunctions: string[];
};
export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  status: string;
  revision: number;
  publishedRevision: number;
  concurrencyStamp?: string;
  ownerUserId?: string;
  isBuiltIn: boolean;
  canEdit: boolean;
  definition: ReportDesign;
};
export type ReportSave = {
  name: string;
  description: string;
  visibility: string;
  concurrencyStamp?: string;
  publish: boolean;
  definition: ReportDesign;
};
export type ReportRun = {
  id: string;
  name: string;
  templateId: string;
  revision: number;
  dataSource: string;
  status: string;
  capturedAt: string;
  expiresAt: string;
  rowCount: number;
  errorMessage?: string;
  isExpired: boolean;
  parameters: ReportParameters;
  columns: HrReportField[];
  totals: Record<string, number | null>;
  warnings: string[];
  chart?: HrReportChartPreview;
  excelReady: boolean;
  pdfReady: boolean;
  excelStatus: string;
  pdfStatus: string;
};
export type ReportPage = {
  totalCount: number;
  page: number;
  pageSize: number;
  rows: Record<string, unknown>[];
};
export type ReportRunHistory = { items: ReportRun[]; hasMore: boolean };
export type ReportPreview = {
  timeZone?: string;
  columns: HrReportField[];
  rows: Record<string, unknown>[];
  totalCount: number;
  totals: Record<string, number | null>;
  warnings: string[];
  chart?: HrReportChartPreview;
};
export type ReportOptions = {
  staff: { id: string; label: string }[];
  staffGroups: { id: string; label: string }[];
  departments: { id: string; label: string }[];
  academicYears: { id: string; label: string }[];
  sections: { id: string; label: string }[];
  cycles: { id: string; label: string }[];
};

const root = '/hr/reports';
const libraryTags = [{ type: employeeType.hrReports, id: 'library' }];
const runTags = [{ type: employeeType.hrReports, id: 'runs' }];
export const reportingWorkspaceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReportingCatalogue: builder.query<ReportDataset[], void>({
      query: () => `${root}/catalogue`,
      providesTags: libraryTags,
    }),
    getReportingLibrary: builder.query<ReportTemplate[], { edit?: boolean } | void>({
      query: (params) => ({ url: `${root}/library`, params: params || {} }),
      providesTags: libraryTags,
    }),
    getReportingOptions: builder.query<ReportOptions, { dataset: string; search?: string }>({
      query: (params) => ({ url: `${root}/workspace-options`, params }),
    }),
    saveReportingTemplate: builder.mutation<ReportTemplate, { id?: string; body: ReportSave }>({
      query: ({ id, body }) => ({
        url: `${root}/library${id ? `/${id}` : ''}`,
        method: id ? 'PUT' : 'POST',
        body,
      }),
      invalidatesTags: libraryTags,
    }),
    archiveReportingTemplate: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `${root}/library/${id}/archive`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      invalidatesTags: libraryTags,
    }),
    previewReportingDesign: builder.mutation<
      ReportPreview,
      { definition: ReportDesign; parameters: ReportParameters }
    >({ query: (body) => ({ url: `${root}/designer-preview`, method: 'POST', body }) }),
    createReportingRun: builder.mutation<
      ReportRun,
      { templateId: string; revision: number; parameters: ReportParameters }
    >({
      query: (body) => ({ url: `${root}/runs`, method: 'POST', body }),
      invalidatesTags: runTags,
    }),
    getReportingRuns: builder.query<ReportRunHistory, { skip?: number; take?: number }>({
      query: (params) => ({ url: `${root}/runs`, params }),
      providesTags: runTags,
    }),
    getReportingRun: builder.query<ReportRun, string>({
      query: (id) => `${root}/runs/${id}`,
      providesTags: (_result, _error, id) => [{ type: employeeType.hrReports, id }],
    }),
    getReportingRows: builder.query<ReportPage, { id: string; page: number; pageSize: number }>({
      query: ({ id, ...params }) => ({ url: `${root}/runs/${id}/rows`, params }),
    }),
    cancelReportingRun: builder.mutation<void, string>({
      query: (id) => ({ url: `${root}/runs/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [...runTags, { type: employeeType.hrReports, id }],
    }),
    retryReportingRun: builder.mutation<ReportRun, string>({
      query: (id) => ({ url: `${root}/runs/${id}/retry`, method: 'POST' }),
      invalidatesTags: runTags,
    }),
    exportReportingRun: builder.mutation<void, { id: string; format: 'excel' | 'pdf' }>({
      query: ({ id, format }) => ({
        url: `${root}/runs/${id}/exports`,
        method: 'POST',
        params: { format },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: employeeType.hrReports, id }],
    }),
    downloadReportingRun: builder.mutation<Blob, { id: string; format: 'excel' | 'pdf' }>({
      query: ({ id, format }) => ({
        url: `${root}/runs/${id}/download`,
        params: { format },
        responseHandler: (response) => (response.ok ? response.blob() : response.json()),
      }),
    }),
  }),
});

export const {
  useGetReportingCatalogueQuery,
  useGetReportingLibraryQuery,
  useGetReportingOptionsQuery,
  useSaveReportingTemplateMutation,
  useArchiveReportingTemplateMutation,
  usePreviewReportingDesignMutation,
  useCreateReportingRunMutation,
  useGetReportingRunsQuery,
  useGetReportingRunQuery,
  useGetReportingRowsQuery,
  useCancelReportingRunMutation,
  useRetryReportingRunMutation,
  useExportReportingRunMutation,
  useDownloadReportingRunMutation,
} = reportingWorkspaceApi;
