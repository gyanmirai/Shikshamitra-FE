import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { AdmissionCrmReportFrequency, PagedResult } from './core-leads-contracts';

import {
  AdmissionCrmTimelineEventDto,
  AdmissionCrmTimelineEventType,
} from './communication-exams-events-contracts';

import { AdmissionCrmRetentionPolicyDto } from './final-admission-contracts';

import {
  AdmissionCrmAdmissionReportDto,
  AdmissionCrmAdmissionReportParams,
  AdmissionCrmAdmissionYearStandardOptionDto,
  AdmissionCrmAnalyticsSummaryDto,
  AdmissionCrmAnalyticsSummaryParams,
  AdmissionCrmDataQualityIssueDto,
  AdmissionCrmDataQualityIssueSeverity,
  AdmissionCrmDataQualityIssueStatus,
  AdmissionCrmEnrollmentOverviewDto,
  AdmissionCrmExportDownloadDto,
  AdmissionCrmExportReportType,
  AdmissionCrmExportRequestDto,
  AdmissionCrmForecastDto,
  AdmissionCrmMyWorkDto,
  AdmissionCrmMyWorkFilters,
  AdmissionCrmOperationsQueueDto,
  AdmissionCrmOperationsQueueFilters,
  AdmissionCrmOperationsQueueSummaryDto,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmOperationsSavedViewDto,
  AdmissionCrmPrivacyRequestDto,
  AdmissionCrmPrivacyRequestType,
  AdmissionCrmReconciliationResultDto,
  AdmissionCrmReportScheduleDto,
  AdmissionCrmReportScheduleRunResultDto,
  AdmissionCrmStandardOptionDto,
  AdmissionCrmWorkDelegationDto,
  buildAdmissionCrmAdmissionReportRequest,
  buildAdmissionCrmAnalyticsSummaryRequest,
  buildAdmissionCrmDataQualityListRequest,
  buildAdmissionCrmEnrollmentOverviewRequest,
  buildAdmissionCrmMyWorkRequest,
  buildAdmissionCrmOperationalStandardOptionsRequest,
  buildAdmissionCrmOperationsQueueRequest,
  buildAdmissionCrmOperationsQueueSummaryRequest,
} from './operations-governance-contracts';

export const AdmissionCrmOperationsGovernanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCrmOperationalStandardOptions: builder.query<
      AdmissionCrmAdmissionYearStandardOptionDto[],
      { academicYearId: string }
    >({
      query: buildAdmissionCrmOperationalStandardOptionsRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmAdmissionYearStandardOptions: builder.query<
      AdmissionCrmAdmissionYearStandardOptionDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/standard-options`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmAnalyticsSummary: builder.query<
      AdmissionCrmAnalyticsSummaryDto,
      { academicYearId: string } & AdmissionCrmAnalyticsSummaryParams
    >({
      query: buildAdmissionCrmAnalyticsSummaryRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.task,
      ],
    }),
    getAdmissionCrmAdmissionReport: builder.query<
      AdmissionCrmAdmissionReportDto,
      { academicYearId: string } & AdmissionCrmAdmissionReportParams
    >({
      query: buildAdmissionCrmAdmissionReportRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
      ],
    }),
    getAdmissionCrmOperationsQueueSummary: builder.query<
      AdmissionCrmOperationsQueueSummaryDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmOperationsQueueSummaryRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmEnrollmentOverview: builder.query<
      AdmissionCrmEnrollmentOverviewDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmEnrollmentOverviewRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
      ],
    }),
    getAdmissionCrmStandardOptions: builder.query<
      AdmissionCrmStandardOptionDto[],
      { mediumId: string }
    >({
      query: ({ mediumId }) => ({
        url: `/education-medium/${mediumId}/standards`,
        method: 'GET',
      }),
    }),
    getAdmissionCrmMyWork: builder.query<
      AdmissionCrmMyWorkDto,
      { academicYearId: string } & AdmissionCrmMyWorkFilters
    >({
      query: buildAdmissionCrmMyWorkRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.task,
      ],
    }),
    getAdmissionCrmOperationsQueue: builder.query<
      AdmissionCrmOperationsQueueDto,
      {
        academicYearId: string;
        queueType: AdmissionCrmOperationsQueueType;
      } & AdmissionCrmOperationsQueueFilters
    >({
      query: buildAdmissionCrmOperationsQueueRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmOperationsSavedViews: builder.query<
      AdmissionCrmOperationsSavedViewDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/saved-views`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmOperationsSavedView: builder.mutation<
      AdmissionCrmOperationsSavedViewDto,
      {
        academicYearId: string;
        name: string;
        queueType: AdmissionCrmOperationsQueueType;
        filters: AdmissionCrmOperationsQueueFilters;
        isShared: boolean;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/saved-views`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    deleteAdmissionCrmOperationsSavedView: builder.mutation<void, { viewId: string }>({
      query: ({ viewId }) => ({
        url: `/student-enrollment/admissions-crm/operations/saved-views/${viewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmDataQualityIssues: builder.query<
      PagedResult<AdmissionCrmDataQualityIssueDto>,
      {
        academicYearId: string;
        status?: AdmissionCrmDataQualityIssueStatus;
        minimumSeverity?: AdmissionCrmDataQualityIssueSeverity;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmDataQualityListRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    runAdmissionCrmReconciliation: builder.mutation<
      AdmissionCrmReconciliationResultDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/reconciliation/run`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    acknowledgeAdmissionCrmDataQualityIssue: builder.mutation<
      AdmissionCrmDataQualityIssueDto,
      { issueId: string; ownerUserId?: string | null }
    >({
      query: ({ issueId, ownerUserId }) => ({
        url: `/student-enrollment/admissions-crm/governance/data-quality/${issueId}/acknowledge`,
        method: 'POST',
        body: { ownerUserId },
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    resolveAdmissionCrmDataQualityIssue: builder.mutation<
      AdmissionCrmDataQualityIssueDto,
      { issueId: string; ignore: boolean; reason: string }
    >({
      query: ({ issueId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/data-quality/${issueId}/resolve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmRetentionPolicies: builder.query<
      AdmissionCrmRetentionPolicyDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/retention-policies`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmPrivacyRequests: builder.query<
      AdmissionCrmPrivacyRequestDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/privacy-requests`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    createAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { leadId: string; type: AdmissionCrmPrivacyRequestType; reason: string }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/governance/privacy-requests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    decideAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { requestId: string; approve: boolean; reason: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/privacy-requests/${requestId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    completeAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { requestId: string; executionReference: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/privacy-requests/${requestId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmExports: builder.query<
      AdmissionCrmExportRequestDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/exports`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    requestAdmissionCrmExport: builder.mutation<
      AdmissionCrmExportRequestDto,
      {
        academicYearId: string;
        reportType: AdmissionCrmExportReportType;
        filters?: Record<string, string | null>;
        expiresInHours?: number;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/exports`,
        method: 'POST',
        body: { ...body, filters: body.filters || {} },
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    downloadAdmissionCrmExport: builder.mutation<
      AdmissionCrmExportDownloadDto,
      { exportId: string }
    >({
      query: ({ exportId }) => ({
        url: `/student-enrollment/admissions-crm/governance/exports/${exportId}/download`,
        method: 'GET',
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmReportSchedules: builder.query<
      AdmissionCrmReportScheduleDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmReportSchedule: builder.mutation<
      AdmissionCrmReportScheduleDto,
      {
        academicYearId: string;
        name: string;
        reportType: AdmissionCrmExportReportType;
        frequency: AdmissionCrmReportFrequency;
        destination: string;
        filters?: Record<string, string | null>;
        nextRunAt: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules`,
        method: 'POST',
        body: { ...body, filters: body.filters || {} },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    setAdmissionCrmReportScheduleActive: builder.mutation<
      AdmissionCrmReportScheduleDto,
      { scheduleId: string; active: boolean }
    >({
      query: ({ scheduleId, active }) => ({
        url: `/student-enrollment/admissions-crm/governance/report-schedules/${scheduleId}/active`,
        method: 'PUT',
        params: { active },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    runDueAdmissionCrmReportSchedules: builder.mutation<
      AdmissionCrmReportScheduleRunResultDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules/run-due`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmDelegations: builder.query<
      AdmissionCrmWorkDelegationDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/delegations`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmDelegation: builder.mutation<
      AdmissionCrmWorkDelegationDto,
      {
        academicYearId: string;
        delegatorUserId: string;
        delegateUserId: string;
        queueTypes: AdmissionCrmOperationsQueueType[];
        startsAt: string;
        endsAt: string;
        reason: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/delegations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    cancelAdmissionCrmDelegation: builder.mutation<
      AdmissionCrmWorkDelegationDto,
      { delegationId: string }
    >({
      query: ({ delegationId }) => ({
        url: `/student-enrollment/admissions-crm/operations/delegations/${delegationId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    searchAdmissionCrmAudit: builder.query<
      PagedResult<AdmissionCrmTimelineEventDto>,
      {
        academicYearId: string;
        leadId?: string;
        actorUserId?: string;
        eventType?: AdmissionCrmTimelineEventType;
        from?: string;
        to?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/student-enrollment/admissions-crm/governance/audit', params }),
      providesTags: [studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmAdvisoryForecast: builder.query<
      AdmissionCrmForecastDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/analytics/advisory-forecast`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
  }),
});

export const {
  useGetAdmissionCrmOperationalStandardOptionsQuery,
  useGetAdmissionCrmAdmissionYearStandardOptionsQuery,
  useGetAdmissionCrmAnalyticsSummaryQuery,
  useGetAdmissionCrmAdmissionReportQuery,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useGetAdmissionCrmStandardOptionsQuery,
  useGetAdmissionCrmEnrollmentOverviewQuery,
  useGetAdmissionCrmMyWorkQuery,
  useGetAdmissionCrmOperationsQueueQuery,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
  useGetAdmissionCrmDataQualityIssuesQuery,
  useRunAdmissionCrmReconciliationMutation,
  useAcknowledgeAdmissionCrmDataQualityIssueMutation,
  useResolveAdmissionCrmDataQualityIssueMutation,
  useGetAdmissionCrmRetentionPoliciesQuery,
  useGetAdmissionCrmPrivacyRequestsQuery,
  useCreateAdmissionCrmPrivacyRequestMutation,
  useDecideAdmissionCrmPrivacyRequestMutation,
  useCompleteAdmissionCrmPrivacyRequestMutation,
  useGetAdmissionCrmExportsQuery,
  useRequestAdmissionCrmExportMutation,
  useDownloadAdmissionCrmExportMutation,
  useGetAdmissionCrmReportSchedulesQuery,
  useCreateAdmissionCrmReportScheduleMutation,
  useSetAdmissionCrmReportScheduleActiveMutation,
  useRunDueAdmissionCrmReportSchedulesMutation,
  useGetAdmissionCrmDelegationsQuery,
  useCreateAdmissionCrmDelegationMutation,
  useCancelAdmissionCrmDelegationMutation,
  useSearchAdmissionCrmAuditQuery,
  useGetAdmissionCrmAdvisoryForecastQuery,
} = AdmissionCrmOperationsGovernanceApi;
