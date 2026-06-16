import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type HrReportFormat = 'pdf' | 'excel';

export type HrReportFilter = {
  employeeIds?: string[];
  departments?: string[];
  statuses?: number[];
  genderType?: number;
  month?: string;
  componentNames?: string[];
  dateField?: string;
  fromDate?: string;
  toDate?: string;
  conditions?: HrReportFilterCondition[];
};

export type HrReportFilterCondition = {
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

export type HrReportTemplate = {
  id: string;
  name: string;
  description?: string;
  category: string;
  dataSource: string;
  visibility: 'private' | 'organization' | string;
  status: 'Draft' | 'Published' | 'Archived' | string;
  ownerUserId: string;
  definition: HrReportRequest;
  creationTime: string;
  lastModificationTime?: string;
};

export type HrReportTemplateList = {
  items: HrReportTemplate[];
};

export type HrReportTemplateRequest = {
  name: string;
  description?: string;
  category: string;
  dataSource: string;
  visibility: 'private' | 'organization' | string;
  status: 'Draft' | 'Published' | 'Archived' | string;
  definition: HrReportRequest;
};

export type HrReportSchedule = {
  id: string;
  name: string;
  templateId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | string;
  deliveryMode: 'inApp' | 'inAppAndEmail' | string;
  status: 'Active' | 'Paused' | string;
  recipientUserIds: string[];
  definition: HrReportRequest;
  nextRunAt: string;
  lastRunAt?: string;
  ownerUserId: string;
  creationTime: string;
  lastModificationTime?: string;
};

export type HrReportScheduleList = {
  items: HrReportSchedule[];
};

export type HrReportScheduleRequest = {
  name: string;
  templateId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | string;
  deliveryMode: 'inApp' | 'inAppAndEmail' | string;
  recipientUserIds: string[];
  definition: HrReportRequest;
  firstRunAt?: string;
};

export type HrReportScheduleRunResponse = {
  scheduleId: string;
  jobId: string;
  nextRunAt: string;
};

export type HrReportRecipient = {
  id: string;
  displayName: string;
  email?: string;
};

export const buildHrReportDownloadUrl = (jobId: string) => `/hr/reports/exports/${jobId}/download`;

export const normalizeHrReportRequest = (request: HrReportRequest): HrReportRequest => ({
  ...request,
  page: request.page && request.page > 0 ? request.page : 1,
  pageSize: request.pageSize && request.pageSize > 0 ? request.pageSize : 50,
  filters: request.filters ?? {},
});

export const hrReportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHrReportOptions: builder.query<HrReportOptions, void>({
      query: () => ({
        url: '/hr/reports/options',
        method: 'GET',
      }),
    }),
    getHrReportSources: builder.query<HrReportSources, void>({
      query: () => ({
        url: '/hr/reports/sources',
        method: 'GET',
      }),
      providesTags: [employeeType.hrReports],
    }),
    getHrReportTemplates: builder.query<HrReportTemplateList, void>({
      query: () => ({
        url: '/hr/reports/templates',
        method: 'GET',
      }),
      providesTags: [employeeType.hrReports],
    }),
    createHrReportTemplate: builder.mutation<HrReportTemplate, HrReportTemplateRequest>({
      query: (body) => ({
        url: '/hr/reports/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    updateHrReportTemplate: builder.mutation<
      HrReportTemplate,
      { id: string; body: HrReportTemplateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/hr/reports/templates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    duplicateHrReportTemplate: builder.mutation<HrReportTemplate, string>({
      query: (id) => ({
        url: `/hr/reports/templates/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    deleteHrReportTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/reports/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
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
    }),
    getHrReportExports: builder.query<HrReportExportJob[], void>({
      query: () => ({
        url: '/hr/reports/exports',
        method: 'GET',
      }),
    }),
    getHrReportExport: builder.query<HrReportExportJob, string>({
      query: (jobId) => ({
        url: `/hr/reports/exports/${jobId}`,
        method: 'GET',
      }),
    }),
    cancelHrReportExport: builder.mutation<HrReportExportJob, string>({
      query: (jobId) => ({
        url: `/hr/reports/exports/${jobId}/cancel`,
        method: 'POST',
      }),
    }),
    retryHrReportExport: builder.mutation<{ jobId: string; status: string }, string>({
      query: (jobId) => ({
        url: `/hr/reports/exports/${jobId}/retry`,
        method: 'POST',
      }),
    }),
    regenerateHrReportExport: builder.mutation<{ jobId: string; status: string }, string>({
      query: (jobId) => ({
        url: `/hr/reports/exports/${jobId}/regenerate`,
        method: 'POST',
      }),
    }),
    shareHrReportExport: builder.mutation<HrReportExportJob, { jobId: string; userIds: string[] }>({
      query: ({ jobId, userIds }) => ({
        url: `/hr/reports/exports/${jobId}/share`,
        method: 'POST',
        body: { userIds },
      }),
    }),
    downloadHrReportExport: builder.mutation<Blob, string>({
      query: (jobId) => ({
        url: buildHrReportDownloadUrl(jobId),
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    getHrReportSchedules: builder.query<HrReportScheduleList, void>({
      query: () => ({
        url: '/hr/reports/schedules',
        method: 'GET',
      }),
      providesTags: [employeeType.hrReports],
    }),
    getHrReportRecipients: builder.query<
      HrReportRecipient[],
      { filter?: string; maxResultCount?: number; ids?: string[] } | void
    >({
      query: (params) => ({
        url: '/hr/reports/recipients',
        method: 'GET',
        params: params
          ? { ...params, ids: params.ids?.filter(Boolean).join(',') || undefined }
          : { maxResultCount: 20 },
      }),
    }),
    createHrReportSchedule: builder.mutation<HrReportSchedule, HrReportScheduleRequest>({
      query: (body) => ({
        url: '/hr/reports/schedules',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    updateHrReportSchedule: builder.mutation<
      HrReportSchedule,
      { id: string; body: HrReportScheduleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/hr/reports/schedules/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    pauseHrReportSchedule: builder.mutation<HrReportSchedule, string>({
      query: (id) => ({
        url: `/hr/reports/schedules/${id}/pause`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    resumeHrReportSchedule: builder.mutation<HrReportSchedule, string>({
      query: (id) => ({
        url: `/hr/reports/schedules/${id}/resume`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    runHrReportScheduleNow: builder.mutation<HrReportScheduleRunResponse, string>({
      query: (id) => ({
        url: `/hr/reports/schedules/${id}/run-now`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
    deleteHrReportSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/reports/schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.hrReports],
    }),
  }),
});

export const {
  useGetHrReportOptionsQuery,
  useGetHrReportSourcesQuery,
  useGetHrReportTemplatesQuery,
  useCreateHrReportTemplateMutation,
  useUpdateHrReportTemplateMutation,
  useDuplicateHrReportTemplateMutation,
  useDeleteHrReportTemplateMutation,
  usePreviewHrReportMutation,
  useCreateHrReportExportMutation,
  useGetHrReportExportsQuery,
  useGetHrReportExportQuery,
  useCancelHrReportExportMutation,
  useRetryHrReportExportMutation,
  useRegenerateHrReportExportMutation,
  useShareHrReportExportMutation,
  useDownloadHrReportExportMutation,
  useGetHrReportSchedulesQuery,
  useGetHrReportRecipientsQuery,
  useCreateHrReportScheduleMutation,
  useUpdateHrReportScheduleMutation,
  usePauseHrReportScheduleMutation,
  useResumeHrReportScheduleMutation,
  useRunHrReportScheduleNowMutation,
  useDeleteHrReportScheduleMutation,
} = hrReportsApi;
