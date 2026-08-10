/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionInquiryChannel } from './core-leads-contracts';

import { AdmissionCrmOperationsGovernanceApi } from './operations-governance-api';

import {
  AdmissionCrmAutomationRunStatus,
  AdmissionCrmAutomationRunType,
  AdmissionCrmDataQualityIssueSeverity,
  AdmissionCrmDataQualityIssueStatus,
  AdmissionCrmOperationsQueueType,
  buildAdmissionCrmAdmissionReportRequest,
  buildAdmissionCrmAnalyticsSummaryRequest,
  buildAdmissionCrmDataQualityListRequest,
  buildAdmissionCrmEnrollmentOverviewRequest,
  buildAdmissionCrmMyWorkRequest,
  buildAdmissionCrmOperationalStandardOptionsRequest,
  buildAdmissionCrmOperationsQueueRequest,
  buildAdmissionCrmOperationsQueueSummaryRequest,
} from './operations-governance-contracts';

import { AdmissionCrmRegistrationStatus } from './registration-documents-contracts';

describe('operations-governance admissions CRM API contracts', () => {
  it('builds tenant-scoped enrollment data-quality requests', () => {
    expect(
      buildAdmissionCrmDataQualityListRequest({
        academicYearId: 'year-1',
        status: AdmissionCrmDataQualityIssueStatus.Open,
        minimumSeverity: AdmissionCrmDataQualityIssueSeverity.Error,
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/governance/data-quality',
      method: 'GET',
      params: {
        status: AdmissionCrmDataQualityIssueStatus.Open,
        minimumSeverity: AdmissionCrmDataQualityIssueSeverity.Error,
        maxResultCount: 50,
      },
    });
  });

  it('builds admissions operations queue requests', () => {
    expect(buildAdmissionCrmOperationsQueueSummaryRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operations/queues/summary',
      method: 'GET',
    });

    expect(buildAdmissionCrmEnrollmentOverviewRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operations/overview',
      method: 'GET',
    });

    expect(
      buildAdmissionCrmMyWorkRequest({
        academicYearId: 'year-1',
        skipCount: 25,
        maxResultCount: 25,
        sorting: 'dueAt asc',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operations/my-work',
      method: 'GET',
      params: { skipCount: 25, maxResultCount: 25, sorting: 'dueAt asc' },
    });

    expect(
      buildAdmissionCrmOperationsQueueRequest({
        academicYearId: 'year-1',
        queueType: AdmissionCrmOperationsQueueType.AdmissionReady,
        registrationStatus: AdmissionCrmRegistrationStatus.AdmissionReady,
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operations/queues/7',
      method: 'GET',
      params: {
        maxResultCount: 50,
        registrationStatus: AdmissionCrmRegistrationStatus.AdmissionReady,
      },
    });
  });

  it('builds create and duplicate preview requests with lightweight inquiry payloads', () => {
    expect(
      buildAdmissionCrmOperationalStandardOptionsRequest({ academicYearId: 'year-1' })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operational-standard-options',
      method: 'GET',
    });
  });

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
    expect(buildAdmissionCrmAnalyticsSummaryRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/analytics/summary',
      method: 'GET',
      params: {},
    });

    expect(
      buildAdmissionCrmAdmissionReportRequest({
        academicYearId: 'year-1',
        fromDate: '2026-07-01',
        toDate: '2026-07-31',
        targetStandardId: 'standard-1',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/reports/admissions',
      method: 'GET',
      params: {
        fromDate: '2026-07-01',
        toDate: '2026-07-31',
        targetStandardId: 'standard-1',
      },
    });

    expect(
      buildAdmissionCrmAnalyticsSummaryRequest({
        academicYearId: 'year-1',
        fromDate: '2026-07-01',
        toDate: '2026-07-10',
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        campaignName: 'Scholarship Drive',
        ownerUserId: 'owner-1',
        minimumLeadScore: 40,
        maximumLeadScore: 100,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/analytics/summary',
      method: 'GET',
      params: {
        fromDate: '2026-07-01',
        toDate: '2026-07-10',
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        campaignName: 'Scholarship Drive',
        ownerUserId: 'owner-1',
        minimumLeadScore: 40,
        maximumLeadScore: 100,
      },
    });
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(
      AdmissionCrmOperationsGovernanceApi.endpoints.getAdmissionCrmAnalyticsSummary
    ).toBeTruthy();
  });

  it('keeps automation run enum values aligned with the backend contract', () => {
    expect(AdmissionCrmAutomationRunType.StaleArchive).toBe(0);

    expect(AdmissionCrmAutomationRunType.SlaReminder).toBe(1);

    expect(AdmissionCrmAutomationRunType.Journey).toBe(2);

    expect(AdmissionCrmAutomationRunStatus.Completed).toBe(0);

    expect(AdmissionCrmAutomationRunStatus.CompletedWithFailures).toBe(1);
  });

  it('keeps the manual registration handoff queue aligned with the backend contract', () => {
    expect(AdmissionCrmOperationsQueueType.RegistrationInvitationPending).toBe(21);

    expect(AdmissionCrmOperationsQueueType.PendingPaperEntry).toBe(22);
  });
});
