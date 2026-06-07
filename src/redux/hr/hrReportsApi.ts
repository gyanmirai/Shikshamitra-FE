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

export type HrReportRequest = {
  reportType: string;
  dataSource?: string;
  format?: HrReportFormat;
  page?: number;
  pageSize?: number;
  columns?: string[];
  sorts?: HrReportSort[];
  groups?: string[];
  summaries?: HrReportSummary[];
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
};

export type HrReportExportJob = {
  id: string;
  reportType: string;
  format: HrReportFormat;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | string;
  fileName?: string;
  errorMessage?: string;
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
    downloadHrReportExport: builder.mutation<Blob, string>({
      query: (jobId) => ({
        url: buildHrReportDownloadUrl(jobId),
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
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
  useDownloadHrReportExportMutation,
} = hrReportsApi;
