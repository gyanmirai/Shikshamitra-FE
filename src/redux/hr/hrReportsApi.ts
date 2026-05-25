import { api } from 'src/redux/service';

export type HrReportFormat = 'pdf' | 'excel';

export type HrReportFilter = {
  employeeIds?: string[];
  departments?: string[];
  statuses?: number[];
  genderType?: number;
  month?: string;
  componentNames?: string[];
  fromDate?: string;
  toDate?: string;
};

export type HrReportRequest = {
  reportType: string;
  format?: HrReportFormat;
  page?: number;
  pageSize?: number;
  filters?: HrReportFilter;
};

export type HrReportColumn = {
  id: string;
  label: string;
};

export type HrReportPreview = {
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
  usePreviewHrReportMutation,
  useCreateHrReportExportMutation,
  useGetHrReportExportsQuery,
  useGetHrReportExportQuery,
  useDownloadHrReportExportMutation,
} = hrReportsApi;
