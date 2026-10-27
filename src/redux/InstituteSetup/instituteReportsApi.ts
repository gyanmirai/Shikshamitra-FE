import type {
  ReportJob, AiPlanInput, AiPlanResult, ReportOptions, ReportPreview,
  ApprovedReport, ReportHistoryRow, ReportHistoryPage, ReportHistoryParams, InstituteReportRequest,
} from 'src/screens/setting/reports/types';

import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

const root = '/app/institute-setup-report';
export const instituteReportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    instituteReportOptions: builder.query<ReportOptions, void>({ query: () => `${root}/options` }),
    instituteReportHistory: builder.query<ReportHistoryPage, ReportHistoryParams>({
      query: (params) => ({ url: `${root}/history`, params }),
      providesTags: [instituteSetupType.reportHistory],
    }),
    instituteReportHistoryExportPage: builder.mutation<ReportHistoryPage, ReportHistoryParams>({
      query: (params) => ({ url: `${root}/history`, params }),
    }),
    instituteReportJob: builder.query<ReportJob, string>({ query: (id) => `${root}/exports/${encodeURIComponent(id)}` }),
    instituteReportStatuses: builder.query<ReportHistoryRow[], string[]>({
      query: (body) => ({ url: `${root}/statuses`, method: 'POST', body }),
      keepUnusedDataFor: 0,
    }),
    instituteReportPreview: builder.mutation<ReportPreview, InstituteReportRequest>({
      query: (body) => ({ url: `${root}/preview`, method: 'POST', body }),
    }),
    instituteReportExport: builder.mutation<ReportJob, InstituteReportRequest>({
      query: (body) => ({ url: `${root}/exports`, method: 'POST', body }),
      invalidatesTags: [instituteSetupType.reportHistory],
    }),
    instituteReportAiPlan: builder.mutation<AiPlanResult, AiPlanInput>({
      query: (body) => ({ url: `${root}/ai/plan`, method: 'POST', body }),
    }),
    instituteReportAiPreview: builder.mutation<ReportPreview, ApprovedReport>({
      query: (body) => ({ url: `${root}/ai/preview`, method: 'POST', body }),
    }),
    instituteReportAiExport: builder.mutation<ReportJob, ApprovedReport>({
      query: (body) => ({ url: `${root}/ai/exports`, method: 'POST', body }),
      invalidatesTags: [instituteSetupType.reportHistory],
    }),
    instituteReportDownload: builder.mutation<Blob, string>({
      query: (id) => ({ url: `${root}/exports/${encodeURIComponent(id)}/download`, responseHandler: (response) => response.ok ? response.blob() : response.json() }),
    }),
  }),
});

export const {
  useInstituteReportOptionsQuery, useInstituteReportHistoryQuery,
  useInstituteReportHistoryExportPageMutation,
  useLazyInstituteReportJobQuery, useInstituteReportStatusesQuery,
  useInstituteReportPreviewMutation, useInstituteReportExportMutation,
  useInstituteReportAiPlanMutation, useInstituteReportAiPreviewMutation,
  useInstituteReportAiExportMutation, useInstituteReportDownloadMutation,
} = instituteReportsApi;
