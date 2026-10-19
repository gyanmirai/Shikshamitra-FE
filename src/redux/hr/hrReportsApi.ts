import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type HrReportFormat = 'pdf' | 'excel';

export type HrReportFilter = {
  employeeIds?: string[];
  departments?: string[];
  statuses?: number[];
  genderType?: number;
  month?: string;
  includeDrafts?: boolean;
  componentNames?: string[];
  dateField?: string;
  fromDate?: string;
  toDate?: string;
  conditions?: HrReportFilterCondition[];
};

export type HrReportFilterCondition = {
  askWhenGenerating?: boolean;
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'gte' | 'lte' | string;
  value?: string;
  values?: string[];
};

export type HrReportSort = {
  field: string;
  direction: 'asc' | 'desc' | string;
};

export type HrReportSummary = {
  field: string;
  function: 'count' | 'sum' | 'avg' | string;
};

export type HrReportChartDefinition = {
  type: 'none' | 'kpi' | 'bar' | 'line' | 'donut' | string;
  categoryField?: string;
  valueField?: string;
  function?: 'count' | 'sum' | 'avg' | string;
  title?: string;
};

export type HrReportRequest = {
  reportType: string;
  dataSource?: string;
  format?: HrReportFormat;
  templateId?: string;
  templateName?: string;
  parentJobId?: string;
  sourceAction?: 'manualExport' | 'retry' | 'regenerate' | 'scheduleRun' | string;
  page?: number;
  pageSize?: number;
  columns?: string[];
  sorts?: HrReportSort[];
  groups?: string[];
  summaries?: HrReportSummary[];
  chart?: HrReportChartDefinition;
  filters?: HrReportFilter;
};

export type HrReportColumn = {
  id: string;
  label: string;
};

export type HrReportPreview = {
  dataSource: string;
  reportType: string;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: HrReportColumn[];
  rows: Record<string, string | null>[];
  normalizedFilters: HrReportFilter;
  totals?: Record<string, number>;
  totalsLabel?: string;
  queryWarnings?: string[];
  chart?: HrReportChartPreview;
};

export type HrReportChartPreview = {
  type: string;
  title: string;
  points: { label: string; value: number }[];
};

export type HrReportExportJob = {
  id: string;
  reportType: string;
  format: HrReportFormat;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | string;
  requestSnapshot?: HrReportRequest;
  parentJobId?: string;
  sourceAction?: 'manualExport' | 'retry' | 'regenerate' | 'scheduleRun' | string;
  templateId?: string;
  templateName?: string;
  fileName?: string;
  errorMessage?: string;
  progressPercent?: number;
  rowCount?: number;
  fileSizeBytes?: number;
  requestedByUserId?: string;
  generatedAt?: string;
  isExpired?: boolean;
  sharedUserIds?: string[];
  creationTime: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
};

export type HrReportExportListParams = {
  requestedFrom?: string;
  requestedTo?: string;
};

export type HrReportOption = {
  id: string;
  label: string;
};

export type HrReportOptions = {
  reportTypes: HrReportOption[];
  departments: HrReportOption[];
  statuses: HrReportOption[];
};

export type HrReportField = {
  id: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | string;
  filterable: boolean;
  sortable: boolean;
  groupable: boolean;
  summarizable: boolean;
  chartable?: boolean;
  operators: string[];
  options: HrReportOption[];
};

export type HrReportSource = {
  id: string;
  category: string;
  label: string;
  description: string;
  fields: HrReportField[];
  defaultColumns: string[];
  defaultSorts: string[];
};

export type HrReportSources = {
  sources: HrReportSource[];
  operators: { id: string; label: string; types: string[] }[];
  formats: HrReportOption[];
};

export const buildHrReportDownloadUrl = (jobId: string) => `/hr/reports/exports/${jobId}/download`;

export const normalizeHrReportRequest = (request: HrReportRequest): HrReportRequest => ({
  ...request,
  page: request.page && request.page > 0 ? request.page : 1,
  pageSize: request.pageSize && request.pageSize > 0 ? request.pageSize : 50,
  filters: request.filters ?? {},
});

// Operational salary-document adapter. The reporting workspace uses hrReportingWorkspaceApi.
export const hrReportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    previewHrReport: builder.mutation<HrReportPreview, HrReportRequest>({
      query: (body) => ({
        url: '/hr/reports/preview',
        method: 'POST',
        body: normalizeHrReportRequest(body),
      }),
    }),
    createHrReportExport: builder.mutation<{ jobId: string; status: string }, HrReportRequest>({
      query: (body) => ({
        url: '/hr/reports/exports',
        method: 'POST',
        body: normalizeHrReportRequest(body),
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    getHrReportExport: builder.query<HrReportExportJob, string>({
      query: (id) => `/hr/reports/exports/${id}`,
    }),
    downloadHrReportExport: builder.mutation<Blob, string>({
      query: (id) => ({
        url: buildHrReportDownloadUrl(id),
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});
export const {
  usePreviewHrReportMutation,
  useCreateHrReportExportMutation,
  useGetHrReportExportQuery,
  useDownloadHrReportExportMutation,
} = hrReportsApi;
