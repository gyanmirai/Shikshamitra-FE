import type {
  ReportJob, AiPlanInput, AiPlanResult, ReportOptions, ReportPreview,
  ApprovedReport, InstituteReportRequest,
} from 'src/screens/setting/reports/types';

import { api } from 'src/redux/service';

const root = '/app/institute-setup-report';
export const instituteReportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    instituteReportOptions: builder.query<ReportOptions, void>({ query: () => `${root}/options` }),
    instituteReportHistory: builder.query<ReportJob[], void>({ query: () => `${root}/exports` }),
    instituteReportPreview: builder.mutation<ReportPreview, InstituteReportRequest>({
      query: (body) => ({ url: `${root}/preview`, method: 'POST', body }),
    }),
    instituteReportExport: builder.mutation<ReportJob, InstituteReportRequest>({
      query: (body) => ({ url: `${root}/exports`, method: 'POST', body }),
    }),
    instituteReportAiPlan: builder.mutation<AiPlanResult, AiPlanInput>({
      query: (body) => ({ url: `${root}/ai/plan`, method: 'POST', body }),
    }),
    instituteReportAiPreview: builder.mutation<ReportPreview, ApprovedReport>({
      query: (body) => ({ url: `${root}/ai/preview`, method: 'POST', body }),
    }),
    instituteReportAiExport: builder.mutation<ReportJob, ApprovedReport>({
      query: (body) => ({ url: `${root}/ai/exports`, method: 'POST', body }),
    }),
    instituteReportDownload: builder.mutation<Blob, string>({
      query: (id) => ({ url: `${root}/exports/${encodeURIComponent(id)}/download`, responseHandler: (response) => response.ok ? response.blob() : response.json() }),
    }),
  }),
});

export const {
  useInstituteReportOptionsQuery, useInstituteReportHistoryQuery,
  useInstituteReportPreviewMutation, useInstituteReportExportMutation,
  useInstituteReportAiPlanMutation, useInstituteReportAiPreviewMutation,
  useInstituteReportAiExportMutation, useInstituteReportDownloadMutation,
} = instituteReportsApi;
