/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  StudentAdmissionsCrmApi,
  AdmissionCrmLeadPriority,
  AdmissionCrmFormFieldType,
  AdmissionCrmMessageChannel,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmPlaybookStatus,
  AdmissionCrmSeatPoolStatus,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmRegistrationPath,
  AdmissionCrmPolicyPackStatus,
  AdmissionCrmAutomationRunType,
  AdmissionCrmTimelineEventType,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmExamReadinessField,
  buildAdmissionCrmMyWorkRequest,
  AdmissionCrmAutomationRunStatus,
  AdmissionCrmLeadRoutingStrategy,
  AdmissionCrmOperationsQueueType,
  buildAdmissionCrmExamListRequest,
  buildAdmissionCrmLeadListRequest,
  buildAdmissionCrmTimelineRequest,
  buildAdmissionCrmOfferListRequest,
  AdmissionCrmDataQualityIssueStatus,
  buildCreateAdmissionCrmLeadRequest,
  buildPublicAdmissionCrmFormRequest,
  buildAddAdmissionCrmLeadNoteRequest,
  buildCreateAdmissionCrmOfferRequest,
  AdmissionCrmDataQualityIssueSeverity,
  buildScheduleAdmissionCrmExamRequest,
  buildAdmissionCrmPlaybookListRequest,
  buildAdmissionCrmSeatPoolListRequest,
  buildAdmissionCrmSlaReminderRunRequest,
  buildCreateAdmissionCrmPlaybookRequest,
  buildCreateAdmissionCrmSeatPoolRequest,
  buildAdmissionCrmPolicyPackListRequest,
  buildBulkAdmissionCrmExamResultsRequest,
  buildAdmissionCrmOperationsQueueRequest,
  buildAdmissionCrmJourneyRulesRunRequest,
  buildChangeAdmissionCrmLeadStageRequest,
  buildResolveAdmissionCrmPlaybookRequest,
  buildAdmissionCrmDecisionHistoryRequest,
  buildAdmissionCrmDataQualityListRequest,
  buildAdmissionCrmAdmissionReportRequest,
  buildAdmissionCrmAnalyticsSummaryRequest,
  buildPublicAdmissionCrmDocumentUploadUrl,
  buildPreviewAdmissionCrmExamResultRequest,
  buildAdmissionCrmActivationPreviewRequest,
  buildAdmissionCrmEnrollmentOverviewRequest,
  buildChangeAdmissionCrmLeadPriorityRequest,
  buildMergeAdmissionCrmDuplicateLeadRequest,
  buildAssignAdmissionCrmSpecialRouteRequest,
  buildAdmissionCrmQuickInquiryOptionsRequest,
  buildAdmissionCrmMessageTemplateListRequest,
  buildSendAdmissionCrmTemplateMessageRequest,
  buildAdmissionCrmRouteDefinitionListRequest,
  AdmissionCrmApplicantChecklistProgressStatus,
  buildAdmissionCrmFormNumberSeriesListRequest,
  buildIssueAdmissionCrmRegistrationFormRequest,
  buildPreviewAdmissionCrmLeadDuplicatesRequest,
  buildGenerateAdmissionCrmPlaybookSlotsRequest,
  buildRecommendAdmissionCrmPlaybookSlotRequest,
  buildAdmissionCrmOperationsQueueSummaryRequest,
  buildAdmissionCrmLeadApplicantChecklistRequest,
  buildAdmissionCrmCommunicationProvidersRequest,
  buildAdmissionCrmMessageDeliveryLogListRequest,
  buildPublicAdmissionCrmDeliveryCallbackRequest,
  buildPreviewAdmissionCrmMessageTemplateRequest,
  buildSavePublicAdmissionCrmRegistrationRequest,
  buildAdmissionCrmCommunicationOptOutListRequest,
  buildAssignAdmissionCrmDocumentChecklistRequest,
  buildAdmissionCrmRegistrationTemplateListRequest,
  buildAdmissionCrmOperationalStandardOptionsRequest,
  buildCreateAdmissionCrmRegistrationTemplateRequest,
  buildUpdateAdmissionCrmCommunicationProviderRequest,
  buildUpdateAdmissionCrmLeadApplicantChecklistRequest,
  buildIssueAdmissionCrmRegistrationApplicationRequest,
  buildAdmissionCrmDocumentChecklistTemplateListRequest,
  buildAdmissionCrmSchoolDefaultCycleConfigurationRequest,
  buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest,
} from './admissions-crm-api';

import type {
  AdmissionCrmFormFieldDto,
  AdmissionCrmFormTemplateDto,
  AdmissionCrmChannelSettingDto,
  AdmissionCrmLeadRoutingRuleDto,
  AdmissionCrmAnalyticsSummaryDto,
  AdmissionCrmEnrollmentOverviewDto,
  AdmissionCrmApplicantChecklistItemDto,
  AdmissionCrmApplicantChecklistProgressDto,
} from './admissions-crm-api';

describe('admissions CRM API contracts', () => {
  it('builds policy, activation, and governed-route requests', () => {
    expect(
      buildAdmissionCrmPolicyPackListRequest({
        status: AdmissionCrmPolicyPackStatus.Published,
        board: 'CBSE',
        jurisdiction: 'Gujarat',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/policy-packs',
      method: 'GET',
      params: {
        status: AdmissionCrmPolicyPackStatus.Published,
        board: 'CBSE',
        jurisdiction: 'Gujarat',
      },
    });

    const activationBody = {
      educationBoardId: 'board-1',
      academicMediumId: 'medium-1',
      academicMediumStageId: 'stage-1',
      standardId: 'standard-1',
      divisionId: 'division-1',
      grNumberSeriesId: 'series-1',
    };
    expect(
      buildAdmissionCrmActivationPreviewRequest({ leadId: 'lead-1', body: activationBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/activation/preview',
      method: 'POST',
      body: activationBody,
    });

    expect(buildAdmissionCrmRouteDefinitionListRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/admission-routes',
      method: 'GET',
    });
    const routeBody = {
      routeDefinitionId: 'route-1',
      routeData: { allotmentNumber: 'RTE-100' },
      evidenceReferences: ['ALLOTMENT:RTE-100'],
      reason: 'Official allotment matched.',
    };
    expect(
      buildAssignAdmissionCrmSpecialRouteRequest({ leadId: 'lead-1', body: routeBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/admission-route',
      method: 'POST',
      body: routeBody,
    });
  });

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

  it('builds final-admission seat, offer, and decision requests', () => {
    expect(
      buildAdmissionCrmSeatPoolListRequest({
        academicYearId: 'year-1',
        status: AdmissionCrmSeatPoolStatus.Active,
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/seat-pools',
      method: 'GET',
      params: { status: AdmissionCrmSeatPoolStatus.Active, maxResultCount: 50 },
    });

    const poolBody = {
      code: 'GRADE-1-GEN',
      name: 'Grade 1 general',
      desiredClass: 'Grade 1',
      operationalTarget: 40,
      approvedCapacity: 40,
      isActive: true,
    };
    expect(
      buildCreateAdmissionCrmSeatPoolRequest({ academicYearId: 'year-1', body: poolBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/seat-pools',
      method: 'POST',
      body: poolBody,
    });

    expect(
      buildAdmissionCrmOfferListRequest({
        academicYearId: 'year-1',
        leadId: 'lead-1',
        status: AdmissionCrmSeatOfferStatus.Issued,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/offers',
      method: 'GET',
      params: { leadId: 'lead-1', status: AdmissionCrmSeatOfferStatus.Issued },
    });

    const offerBody = {
      seatPoolId: 'pool-1',
      offerType: 1,
      terms: { conditions: 'Accept before expiry.' },
      language: 'en',
      validFrom: '2026-07-12T00:00:00.000Z',
      validUntil: '2026-07-19T00:00:00.000Z',
    };
    expect(buildCreateAdmissionCrmOfferRequest({ leadId: 'lead-1', body: offerBody })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/final-admission/offers',
      method: 'POST',
      body: offerBody,
    });
    expect(buildAdmissionCrmDecisionHistoryRequest({ leadId: 'lead-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/final-admission/decisions',
      method: 'GET',
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

  it('keeps enrollment overview operational insight fields in the contract', () => {
    const overview = {
      academicYearId: 'year-1',
      generatedAt: '2026-07-27T00:00:00Z',
      unassignedLeadCount: 1,
      upcomingExamCount: 2,
      examNoShowCount: 3,
      pendingPaperEntryCount: 4,
      expiringRegistrationCount: 5,
      documentFollowUpCount: 6,
      feeFollowUpCount: 7,
      pendingApprovalCount: 8,
      expiringOfferCount: 9,
      classPlacementRiskCount: 10,
      activationFailureCount: 11,
      handoffBlockerCount: 12,
      urgentCount: 13,
      queues: [],
      urgentItems: [],
    } satisfies AdmissionCrmEnrollmentOverviewDto;

    expect(overview.pendingPaperEntryCount).toBe(4);
    expect(overview.classPlacementRiskCount).toBe(10);
  });

  it('builds versioned admissions playbook requests in the CRM route family', () => {
    const body = {
      name: 'Primary admissions playbook',
      isFallback: false,
      registrationPath: AdmissionCrmRegistrationPath.RegistrationAfterExam,
      applicability: { campus: 'Main Campus', desiredClass: 'Grade 1' },
      stages: [],
      rounds: [],
      seatPlans: [],
      examDefinitions: [],
      slotTemplates: [],
      assignmentRules: [],
      notes: 'Cycle-specific policy',
    };

    expect(
      buildAdmissionCrmPlaybookListRequest({
        academicYearId: 'year-1',
        status: AdmissionCrmPlaybookStatus.Published,
        maxResultCount: 25,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/playbooks',
      method: 'GET',
      params: {
        status: AdmissionCrmPlaybookStatus.Published,
        maxResultCount: 25,
      },
    });

    expect(buildCreateAdmissionCrmPlaybookRequest({ academicYearId: 'year-1', body })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/playbooks',
      method: 'POST',
      body,
    });

    expect(
      buildResolveAdmissionCrmPlaybookRequest({
        academicYearId: 'year-1',
        body: { campus: 'Main Campus', desiredClass: 'Grade 1' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/playbooks/resolve',
      method: 'POST',
      body: { campus: 'Main Campus', desiredClass: 'Grade 1' },
    });

    expect(
      buildGenerateAdmissionCrmPlaybookSlotsRequest({
        playbookId: 'playbook-1',
        body: {
          slotTemplateCode: 'PRIMARY-AM',
          fromDate: '2026-08-01',
          toDate: '2026-08-07',
          utcOffsetMinutes: 330,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/configuration/playbooks/playbook-1/slots/generate',
      method: 'POST',
      body: {
        slotTemplateCode: 'PRIMARY-AM',
        fromDate: '2026-08-01',
        toDate: '2026-08-07',
        utcOffsetMinutes: 330,
      },
    });

    expect(
      buildRecommendAdmissionCrmPlaybookSlotRequest({
        playbookId: 'playbook-1',
        body: { assignmentRuleCode: 'EARLIEST' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/configuration/playbooks/playbook-1/slots/recommend',
      method: 'POST',
      body: { assignmentRuleCode: 'EARLIEST' },
    });

    expect(
      buildPreviewAdmissionCrmExamResultRequest({
        playbookId: 'playbook-1',
        body: { examDefinitionCode: 'PRIMARY', componentScores: { WRITTEN: 72 } },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/configuration/playbooks/playbook-1/exam-results/preview',
      method: 'POST',
      body: { examDefinitionCode: 'PRIMARY', componentScores: { WRITTEN: 72 } },
    });
  });

  it('builds lead list requests against the admissions CRM route family', () => {
    expect(
      buildAdmissionCrmLeadListRequest({
        academicYearId: 'year-1',
        filterText: 'riya',
        stage: AdmissionInquiryStage.FollowUp,
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        campaignName: 'Scholarship Drive',
        ownerUserId: 'owner-1',
        priority: AdmissionCrmLeadPriority.Hot,
        maxResultCount: 25,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/leads',
      method: 'GET',
      params: {
        filterText: 'riya',
        stage: AdmissionInquiryStage.FollowUp,
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        campaignName: 'Scholarship Drive',
        ownerUserId: 'owner-1',
        priority: AdmissionCrmLeadPriority.Hot,
        maxResultCount: 25,
      },
    });
  });

  it('builds registration configuration and secure applicant requests', () => {
    const templateBody = {
      name: 'Primary registration',
      isFallback: true,
      applicability: {},
      sections: [],
      linkExpiryDays: 14,
      allowPartialSave: true,
      feeRequired: true,
      feeAmount: 250,
      notes: null,
    };
    expect(
      buildAdmissionCrmRegistrationTemplateListRequest({
        academicYearId: 'year-1',
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/registration-templates',
      method: 'GET',
      params: { maxResultCount: 50 },
    });
    expect(
      buildCreateAdmissionCrmRegistrationTemplateRequest({
        academicYearId: 'year-1',
        body: templateBody,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/registration-templates',
      method: 'POST',
      body: templateBody,
    });
    expect(buildAdmissionCrmFormNumberSeriesListRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/form-number-series',
      method: 'GET',
    });
    expect(
      buildIssueAdmissionCrmRegistrationApplicationRequest({
        leadId: 'lead-1',
        body: {
          registrationTemplateId: 'template-1',
          formNumberSeriesId: 'series-1',
          waiveFee: false,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/registrations/issue',
      method: 'POST',
      body: {
        registrationTemplateId: 'template-1',
        formNumberSeriesId: 'series-1',
        waiveFee: false,
      },
    });
    expect(
      buildSavePublicAdmissionCrmRegistrationRequest({
        tenantId: 'tenant-1',
        token: 'status-token',
        body: { accessSessionToken: 'session-token', responses: { firstName: 'Aarav' } },
      })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/status/status-token/registration',
      method: 'PUT',
      body: { accessSessionToken: 'session-token', responses: { firstName: 'Aarav' } },
    });
  });

  it('builds document checklist and applicant upload routes', () => {
    expect(
      buildAdmissionCrmDocumentChecklistTemplateListRequest({
        academicYearId: 'year-1',
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/document-checklists',
      method: 'GET',
      params: { maxResultCount: 50 },
    });
    expect(
      buildAssignAdmissionCrmDocumentChecklistRequest({
        registrationApplicationId: 'registration-1',
        checklistTemplateId: 'checklist-1',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/registrations/registration-1/document-checklist',
      method: 'POST',
      body: { checklistTemplateId: 'checklist-1' },
    });
    expect(
      buildPublicAdmissionCrmDocumentUploadUrl({ tenantId: 'tenant-1', token: 'status-token' })
    ).toBe(
      '/public/student-enrollment/admissions-crm/tenant-1/status/status-token/registration/documents'
    );
  });

  it('builds create and duplicate preview requests with lightweight inquiry payloads', () => {
    const body = {
      channel: AdmissionInquiryChannel.QuickCallEntry,
      firstName: 'Riya',
      middleName: 'Manoj',
      lastName: 'Shah',
      dateOfBirth: '2018-05-12T00:00:00.000Z',
      primaryContactNo: '9988776655',
      admissionIntent: 'Admission inquiry for Grade 1',
      intendedRouteDefinitionId: 'route-fresh-v2',
      campusBranchName: 'North Campus',
      preferredCommunicationLanguage: 'Hindi',
    };

    expect(buildCreateAdmissionCrmLeadRequest({ academicYearId: 'year-1', body })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/leads',
      method: 'POST',
      body,
    });

    expect(buildAdmissionCrmQuickInquiryOptionsRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/quick-inquiry-options',
      method: 'GET',
    });

    expect(
      buildAdmissionCrmOperationalStandardOptionsRequest({ academicYearId: 'year-1' })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/operational-standard-options',
      method: 'GET',
    });

    expect(
      buildPreviewAdmissionCrmLeadDuplicatesRequest({
        academicYearId: 'year-1',
        body: {
          firstName: 'Riya',
          dateOfBirth: '2018-05-12T00:00:00.000Z',
          parentGuardianName: 'Meera Shah',
          primaryContactNo: '9988776655',
          admissionIntent: 'Admission inquiry for Grade 1',
          desiredClassName: 'Grade 1',
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/leads/duplicate-preview',
      method: 'POST',
      body: {
        firstName: 'Riya',
        dateOfBirth: '2018-05-12T00:00:00.000Z',
        parentGuardianName: 'Meera Shah',
        primaryContactNo: '9988776655',
        admissionIntent: 'Admission inquiry for Grade 1',
        desiredClassName: 'Grade 1',
      },
    });
  });

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
    expect(
      buildChangeAdmissionCrmLeadStageRequest({
        leadId: 'lead-1',
        body: {
          stage: AdmissionInquiryStage.ExamReady,
          reason: 'Counsellor confirmed exam readiness.',
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/stage',
      method: 'POST',
      body: {
        stage: AdmissionInquiryStage.ExamReady,
        reason: 'Counsellor confirmed exam readiness.',
      },
    });

    expect(
      buildChangeAdmissionCrmLeadPriorityRequest({
        leadId: 'lead-1',
        body: {
          priority: AdmissionCrmLeadPriority.Hot,
          reason: 'Parent visited campus and requested same-week exam.',
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/priority',
      method: 'POST',
      body: {
        priority: AdmissionCrmLeadPriority.Hot,
        reason: 'Parent visited campus and requested same-week exam.',
      },
    });

    expect(
      buildIssueAdmissionCrmRegistrationFormRequest({
        leadId: 'lead-1',
        body: {
          formNumber: 'CRM-2026-001',
          amount: 250,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/registration-form',
      method: 'POST',
      body: {
        formNumber: 'CRM-2026-001',
        amount: 250,
      },
    });

    expect(
      buildMergeAdmissionCrmDuplicateLeadRequest({
        leadId: 'lead-1',
        body: { duplicateLeadId: 'lead-2', reason: 'Same parent contact.' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/duplicates/merge',
      method: 'POST',
      body: { duplicateLeadId: 'lead-2', reason: 'Same parent contact.' },
    });

    expect(buildAdmissionCrmExamListRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/exams',
      method: 'GET',
      params: {},
    });
    expect(
      buildAdmissionCrmExamListRequest({ academicYearId: 'year-1', filterText: 'Riya' })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/exams',
      method: 'GET',
      params: { filterText: 'Riya' },
    });

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

    expect(buildAdmissionCrmSlaReminderRunRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/automation/sla-reminders/run',
      method: 'POST',
    });

    expect(
      buildAdmissionCrmJourneyRulesRunRequest({
        academicYearId: 'year-1',
        body: { trigger: AdmissionCrmJourneyTrigger.LeadCreated, leadId: 'lead-1' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/automation/journeys/run',
      method: 'POST',
      body: { trigger: AdmissionCrmJourneyTrigger.LeadCreated, leadId: 'lead-1' },
    });

    expect(buildAdmissionCrmCommunicationProvidersRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/communication/providers',
      method: 'GET',
    });

    expect(
      buildAdmissionCrmCommunicationOptOutListRequest({
        academicYearId: 'year-1',
        channel: AdmissionCrmMessageChannel.Sms,
        isActive: true,
        contactSearch: '9988',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/communication/opt-outs',
      method: 'GET',
      params: {
        channel: AdmissionCrmMessageChannel.Sms,
        isActive: true,
        contactSearch: '9988',
      },
    });

    expect(buildAdmissionCrmSchoolDefaultCycleConfigurationRequest()).toEqual({
      url: '/student-enrollment/admissions-crm/configuration/cycle-default',
      method: 'GET',
    });

    expect(
      buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest({
        body: {
          cycleName: 'School CRM Defaults',
          staleAfterDays: 21,
          archiveAfterDays: 60,
          applicantChecklist: [
            {
              key: 'birth-certificate',
              label: 'Birth certificate',
              details: 'Bring the original document for verification.',
              isRequired: true,
              displayOrder: 10,
            },
          ],
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/configuration/cycle-default',
      method: 'PUT',
      body: {
        cycleName: 'School CRM Defaults',
        staleAfterDays: 21,
        archiveAfterDays: 60,
        applicantChecklist: [
          {
            key: 'birth-certificate',
            label: 'Birth certificate',
            details: 'Bring the original document for verification.',
            isRequired: true,
            displayOrder: 10,
          },
        ],
      },
    });

    const providerSettings = {
      adapter: 'webhook',
      payloadMode: 'default',
      responseProviderMessageIdPath: 'messages.0.id',
      headers: {},
      parameters: {},
      callbackSecret: 'secret-1',
      callbackMappings: {
        statusPath: 'event.status',
        statusDetailsPath: 'event.description',
        providerMessageIdPath: 'message.id',
        callbackSecretPath: 'auth.secret',
      },
    };

    expect(
      buildUpdateAdmissionCrmCommunicationProviderRequest({
        academicYearId: 'year-1',
        channel: AdmissionCrmMessageChannel.WhatsApp,
        body: {
          isEnabled: true,
          providerName: 'WhatsApp Sandbox',
          webhookUrl: 'https://provider.example.test/admissions',
          settings: providerSettings,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/communication/providers/0',
      method: 'PUT',
      body: {
        isEnabled: true,
        providerName: 'WhatsApp Sandbox',
        webhookUrl: 'https://provider.example.test/admissions',
        settings: providerSettings,
      },
    });

    expect(buildAdmissionCrmTimelineRequest({ leadId: 'lead-1', maxResultCount: 20 })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/timeline',
      method: 'GET',
      params: {
        maxResultCount: 20,
      },
    });

    expect(buildAdmissionCrmLeadApplicantChecklistRequest({ leadId: 'lead-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/applicant-checklist',
      method: 'GET',
    });

    expect(
      buildUpdateAdmissionCrmLeadApplicantChecklistRequest({
        leadId: 'lead-1',
        key: 'birth-certificate',
        body: {
          status: AdmissionCrmApplicantChecklistProgressStatus.Received,
          notes: 'Original seen at reception.',
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/applicant-checklist/birth-certificate',
      method: 'PUT',
      body: {
        status: AdmissionCrmApplicantChecklistProgressStatus.Received,
        notes: 'Original seen at reception.',
      },
    });

    expect(
      buildAddAdmissionCrmLeadNoteRequest({
        leadId: 'lead-1',
        body: {
          note: 'Parent asked for transport details.',
          isCallNote: true,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/notes',
      method: 'POST',
      body: {
        note: 'Parent asked for transport details.',
        isCallNote: true,
      },
    });

    expect(
      buildAdmissionCrmMessageTemplateListRequest({
        academicYearId: 'year-1',
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/configuration/message-templates',
      method: 'GET',
      params: {
        maxResultCount: 50,
      },
    });

    expect(
      buildScheduleAdmissionCrmExamRequest({
        leadId: 'lead-1',
        body: { entranceExamSlotId: 'slot-1' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/exam/schedule',
      method: 'POST',
      body: { entranceExamSlotId: 'slot-1' },
    });

    expect(
      buildSendAdmissionCrmTemplateMessageRequest({
        leadId: 'lead-1',
        body: { templateId: 'template-1', variables: { examDate: '15 July' } },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/messages/send-template',
      method: 'POST',
      body: { templateId: 'template-1', variables: { examDate: '15 July' } },
    });

    expect(
      buildPreviewAdmissionCrmMessageTemplateRequest({
        academicYearId: 'year-1',
        body: {
          templateId: 'template-1',
          leadId: 'lead-1',
          variables: { examDate: '15 July' },
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/communication/message-templates/preview',
      method: 'POST',
      body: {
        templateId: 'template-1',
        leadId: 'lead-1',
        variables: { examDate: '15 July' },
      },
    });

    expect(
      buildAdmissionCrmMessageDeliveryLogListRequest({
        academicYearId: 'year-1',
        leadId: 'lead-1',
        status: 'Queued',
        providerMessageId: 'provider-message-1',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/communication/delivery-logs',
      method: 'GET',
      params: {
        leadId: 'lead-1',
        status: 'Queued',
        providerMessageId: 'provider-message-1',
      },
    });

    expect(
      buildPublicAdmissionCrmDeliveryCallbackRequest({
        tenantId: 'tenant-1',
        deliveryLogId: 'delivery-log-1',
        body: {
          status: 'delivered',
          statusDetails: 'Provider accepted delivery receipt.',
          providerMessageId: 'provider-message-1',
          callbackSecret: 'secret-1',
        },
      })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/communication/delivery-logs/delivery-log-1/callback',
      method: 'POST',
      body: {
        status: 'delivered',
        statusDetails: 'Provider accepted delivery receipt.',
        providerMessageId: 'provider-message-1',
        callbackSecret: 'secret-1',
      },
    });

    expect(
      buildPublicAdmissionCrmDeliveryCallbackRequest({
        tenantId: 'tenant-1',
        deliveryLogId: 'delivery-log-2',
        body: {
          payload: {
            event: {
              status: 'failed',
              description: 'Provider reported delivery failure.',
            },
            message: {
              id: 'provider-message-2',
            },
            auth: {
              secret: 'secret-1',
            },
          },
        },
      })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/communication/delivery-logs/delivery-log-2/callback',
      method: 'POST',
      body: {
        payload: {
          event: {
            status: 'failed',
            description: 'Provider reported delivery failure.',
          },
          message: {
            id: 'provider-message-2',
          },
          auth: {
            secret: 'secret-1',
          },
        },
      },
    });

    expect(
      buildPublicAdmissionCrmFormRequest({ tenantId: 'tenant-1', templateId: 'template-1' })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/forms/template-1',
      method: 'GET',
    });
  });

  it('sends individual rows for bulk entrance exam result entry', () => {
    expect(
      buildBulkAdmissionCrmExamResultsRequest({
        academicYearId: 'year-1',
        items: [
          {
            examRecordId: 'exam-1',
            totalMarks: 100,
            passingMarks: 40,
            obtainedMarks: 76,
            meritRank: 3,
            correctionReason: 'Paper-two marks were omitted.',
          },
          {
            examRecordId: 'exam-2',
            totalMarks: 50,
            passingMarks: 20,
            obtainedMarks: 34,
          },
        ],
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/bulk/exam-results',
      method: 'POST',
      body: {
        items: [
          {
            examRecordId: 'exam-1',
            totalMarks: 100,
            passingMarks: 40,
            obtainedMarks: 76,
            meritRank: 3,
            correctionReason: 'Paper-two marks were omitted.',
          },
          {
            examRecordId: 'exam-2',
            totalMarks: 50,
            passingMarks: 20,
            obtainedMarks: 34,
          },
        ],
      },
    });
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmLeads).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmLead).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.mergeAdmissionCrmDuplicateLead).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.changeAdmissionCrmLeadPriority).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmCycleConfiguration).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmCycleConfiguration).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmConfigurationReferences).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.previewAdmissionCrmConfigurationImpact).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.previewAdmissionCrmConfigurationClone).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.confirmAdmissionCrmConfigurationClone).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmPipelineStages).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmPipelineStage).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.lockAdmissionCrmJourney).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.unlockAdmissionCrmJourney).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmInquirySource).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmInquirySource).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.setAdmissionCrmInquirySourceStatus).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmFormTemplates).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmFormTemplate).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmFormTemplate).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmFormTemplateStatus).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmMessageTemplates).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmMessageTemplate).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmCommunicationProviders).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmCommunicationProvider).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmCommunicationOptOuts).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.sendAdmissionCrmTemplateMessage).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.previewAdmissionCrmMessageTemplate).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmMessageDeliveryLogs).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.retryAdmissionCrmMessageDelivery).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.applyPublicAdmissionCrmDeliveryCallback).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmTask).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.runAdmissionCrmSlaReminders).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmSlaHolds).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.createAdmissionCrmSlaHold).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.resumeAdmissionCrmSlaHold).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.runAdmissionCrmJourneyRules).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmTimeline).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmLeadApplicantChecklist).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmLeadApplicantChecklist).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.addAdmissionCrmLeadNote).toBeTruthy();
    expect(
      StudentAdmissionsCrmApi.endpoints.getAdmissionCrmSchoolDefaultCycleConfiguration
    ).toBeTruthy();
    expect(
      StudentAdmissionsCrmApi.endpoints.updateAdmissionCrmSchoolDefaultCycleConfiguration
    ).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmEntranceExams).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmEligibilityHandoff).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getAdmissionCrmAnalyticsSummary).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.scheduleAdmissionCrmEntranceExam).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.bulkUploadAdmissionCrmExamResults).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.issueAdmissionCrmRegistrationForm).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getCurrentAdmissionCrmRegistrationByLead).toBeTruthy();
    expect(
      StudentAdmissionsCrmApi.endpoints.returnAdmissionCrmRegistrationForCorrection
    ).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.verifyAdmissionCrmRegistration).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.extendAdmissionCrmRegistration).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.reissueAdmissionCrmRegistration).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.uploadAdmissionCrmRegistrationDocument).toBeTruthy();
    expect(
      StudentAdmissionsCrmApi.endpoints.getAdmissionCrmGeneratedDocumentAvailability
    ).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.reviewAdmissionCrmApplicantDocument).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.waiveAdmissionCrmApplicantDocument).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.confirmAdmissionCrmDocumentReadiness).toBeTruthy();
    expect(StudentAdmissionsCrmApi.endpoints.getPublicAdmissionCrmForm).toBeTruthy();
  });

  it('keeps the default exam readiness bitmask aligned with the backend contract', () => {
    expect(
      AdmissionCrmExamReadinessField.Contact |
        AdmissionCrmExamReadinessField.AdmissionIntent |
        AdmissionCrmExamReadinessField.DesiredClass
    ).toBe(7);
  });

  it('keeps routing strategy enum values aligned with the backend contract', () => {
    expect(AdmissionCrmLeadRoutingStrategy.FirstMatchingRule).toBe(0);
    expect(AdmissionCrmLeadRoutingStrategy.RoundRobin).toBe(1);
    expect(AdmissionCrmLeadRoutingStrategy.LeastOpenLeads).toBe(2);
  });

  it('keeps lead priority enum values aligned with the backend contract', () => {
    expect(AdmissionCrmLeadPriority.None).toBe(0);
    expect(AdmissionCrmLeadPriority.Hot).toBe(1);
    expect(AdmissionCrmLeadPriority.Warm).toBe(2);
    expect(AdmissionCrmLeadPriority.Cold).toBe(3);
    expect(AdmissionCrmLeadPriority.Low).toBe(4);
    expect(AdmissionCrmTimelineEventType.PriorityChanged).toBe(19);
  });

  it('keeps routing rule criteria aligned with the backend contract', () => {
    const rule: AdmissionCrmLeadRoutingRuleDto = {
      ruleName: 'Target standard owner',
      isEnabled: true,
      priority: 10,
      ownerUserId: 'owner-1',
      channel: AdmissionInquiryChannel.SchoolWebsiteForm,
      inquirySourceId: 'source-1',
      targetStandardId: 'standard-1',
      campaignContains: 'Scholarship',
      campusBranchContains: 'North',
      preferredLanguageContains: 'Hindi',
      desiredClassContains: 'Grade 2',
    };

    expect(rule).toMatchObject({
      targetStandardId: 'standard-1',
      campaignContains: 'Scholarship',
      campusBranchContains: 'North',
      preferredLanguageContains: 'Hindi',
      desiredClassContains: 'Grade 2',
    });
  });

  it('keeps applicant checklist cycle configuration aligned with the backend contract', () => {
    const applicantChecklist: AdmissionCrmApplicantChecklistItemDto[] = [
      {
        key: 'birth-certificate',
        label: 'Birth certificate',
        details: 'Bring the original document for verification.',
        isRequired: true,
        displayOrder: 10,
      },
      {
        key: 'previous-report-card',
        label: 'Previous report card',
        details: null,
        isRequired: false,
        displayOrder: 20,
      },
    ];

    expect(applicantChecklist).toMatchObject([
      { key: 'birth-certificate', isRequired: true, displayOrder: 10 },
      { key: 'previous-report-card', isRequired: false, displayOrder: 20 },
    ]);
  });

  it('keeps applicant checklist progress aligned with the backend contract', () => {
    const progress: AdmissionCrmApplicantChecklistProgressDto = {
      id: 'progress-1',
      leadId: 'lead-1',
      academicYearId: 'year-1',
      key: 'birth-certificate',
      label: 'Birth certificate',
      details: 'Bring the original document for verification.',
      isRequired: true,
      status: AdmissionCrmApplicantChecklistProgressStatus.Received,
      statusLabel: 'Received',
      isComplete: true,
      notes: 'Original verified.',
      statusChangedAt: '2026-07-10T10:00:00Z',
    };

    expect(AdmissionCrmApplicantChecklistProgressStatus.Pending).toBe(0);
    expect(AdmissionCrmApplicantChecklistProgressStatus.Requested).toBe(1);
    expect(AdmissionCrmApplicantChecklistProgressStatus.Received).toBe(2);
    expect(AdmissionCrmApplicantChecklistProgressStatus.Waived).toBe(3);
    expect(progress).toMatchObject({
      key: 'birth-certificate',
      status: AdmissionCrmApplicantChecklistProgressStatus.Received,
      isComplete: true,
    });
  });

  it('keeps inquiry channel cycle configuration aligned with the backend contract', () => {
    const channelSettings: AdmissionCrmChannelSettingDto[] = [
      {
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        isEnabled: true,
        defaultInquirySourceId: 'source-1',
        defaultFormTemplateId: 'form-1',
        defaultOwnerUserId: 'owner-1',
        defaultAcknowledgementTemplateId: 'template-1',
        displayOrder: 10,
      },
      {
        channel: AdmissionInquiryChannel.WhatsAppInquiry,
        isEnabled: false,
        defaultInquirySourceId: null,
        defaultFormTemplateId: null,
        defaultOwnerUserId: null,
        defaultAcknowledgementTemplateId: null,
        displayOrder: 20,
      },
    ];

    expect(channelSettings).toMatchObject([
      {
        channel: AdmissionInquiryChannel.SchoolWebsiteForm,
        isEnabled: true,
        defaultInquirySourceId: 'source-1',
        defaultFormTemplateId: 'form-1',
        defaultOwnerUserId: 'owner-1',
        defaultAcknowledgementTemplateId: 'template-1',
        displayOrder: 10,
      },
      {
        channel: AdmissionInquiryChannel.WhatsAppInquiry,
        isEnabled: false,
        displayOrder: 20,
      },
    ]);
  });

  it('keeps dynamic form template fields aligned with the backend contract', () => {
    const fields: AdmissionCrmFormFieldDto[] = [
      {
        key: 'student-name',
        label: 'Student name',
        fieldType: AdmissionCrmFormFieldType.Text,
        systemField: 'FirstName',
        sectionName: 'Student details',
        helperText: 'Use the name from the birth certificate.',
        placeholder: 'Aarav',
        defaultValue: 'Aarav',
        required: true,
        displayOrder: 10,
        options: [],
      },
      {
        key: 'desired-class',
        label: 'Desired class',
        fieldType: AdmissionCrmFormFieldType.Select,
        systemField: 'DesiredClassName',
        required: true,
        displayOrder: 20,
        options: ['LKG', 'UKG', 'Grade 1'],
        optionLabels: ['Balvatika 1', 'Balvatika 2', 'Dhoran 1'],
      },
      {
        key: 'transport-interest',
        label: 'Transport interest',
        fieldType: AdmissionCrmFormFieldType.Checkbox,
        systemField: null,
        sectionName: 'Transport',
        visibleWhenFieldKey: 'desired-class',
        visibleWhenValue: 'Grade 1',
        required: false,
        displayOrder: 30,
        options: [],
      },
    ];

    expect(fields).toMatchObject([
      {
        key: 'student-name',
        systemField: 'FirstName',
        sectionName: 'Student details',
        helperText: 'Use the name from the birth certificate.',
        placeholder: 'Aarav',
        defaultValue: 'Aarav',
        required: true,
      },
      {
        key: 'desired-class',
        fieldType: AdmissionCrmFormFieldType.Select,
        options: ['LKG', 'UKG', 'Grade 1'],
      },
      {
        key: 'transport-interest',
        systemField: null,
        sectionName: 'Transport',
        visibleWhenFieldKey: 'desired-class',
        visibleWhenValue: 'Grade 1',
        required: false,
      },
    ]);
  });

  it('keeps editable form template payloads aligned with the backend contract', () => {
    const editableTemplate: Omit<AdmissionCrmFormTemplateDto, 'id' | 'academicYearId'> = {
      templateName: 'Primary inquiry',
      description: 'Public primary school inquiry form.',
      channel: AdmissionInquiryChannel.SchoolWebsiteForm,
      isPublic: true,
      isActive: true,
      consentText: 'I agree that the school may contact me.',
      privacyNoticeUrl: 'https://school.example/privacy',
      fields: [
        {
          key: 'student-name',
          label: 'Student name',
          fieldType: AdmissionCrmFormFieldType.Text,
          systemField: 'FirstName',
          sectionName: 'Student details',
          helperText: 'Public form helper text.',
          placeholder: 'Student first name',
          defaultValue: 'Riya',
          required: true,
          displayOrder: 10,
          options: [],
        },
      ],
    };

    expect(editableTemplate).toMatchObject({
      channel: AdmissionInquiryChannel.SchoolWebsiteForm,
      isPublic: true,
      isActive: true,
      fields: [
        {
          key: 'student-name',
          systemField: 'FirstName',
          sectionName: 'Student details',
          helperText: 'Public form helper text.',
          placeholder: 'Student first name',
          defaultValue: 'Riya',
        },
      ],
    });
  });

  it('keeps journey trigger enum values aligned with the backend contract', () => {
    expect(AdmissionCrmJourneyTrigger.LeadCreated).toBe(0);
    expect(AdmissionCrmJourneyTrigger.StageReached).toBe(1);
    expect(AdmissionCrmJourneyTrigger.SlaMissed).toBe(2);
    expect(AdmissionCrmJourneyTrigger.StaleMarked).toBe(3);
    expect(AdmissionCrmJourneyTrigger.ExamScheduled).toBe(4);
    expect(AdmissionCrmJourneyTrigger.ExamCompleted).toBe(5);
    expect(AdmissionCrmJourneyTrigger.EligibilityDecided).toBe(6);
    expect(AdmissionCrmJourneyTrigger.DocumentExpiring).toBe(18);
    expect(AdmissionCrmJourneyTrigger.FeeFollowUp).toBe(19);
    expect(AdmissionCrmJourneyTrigger.OfferIssued).toBe(20);
    expect(AdmissionCrmJourneyTrigger.OfferAccepted).toBe(21);
    expect(AdmissionCrmJourneyTrigger.ActivationWelcome).toBe(22);
  });

  it('keeps timeline event enum values aligned with the backend contract', () => {
    expect(AdmissionCrmTimelineEventType.AutomationFailed).toBe(16);
    expect(AdmissionCrmTimelineEventType.StageChanged).toBe(17);
    expect(AdmissionCrmTimelineEventType.NoteAdded).toBe(18);
    expect(AdmissionCrmTimelineEventType.PriorityChanged).toBe(19);
    expect(AdmissionCrmTimelineEventType.RegistrationFormIssued).toBe(20);
    expect(AdmissionCrmTimelineEventType.ApplicantChecklistUpdated).toBe(21);
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

  it('tracks automation run and failure analytics in the summary contract', () => {
    const analytics: Pick<
      AdmissionCrmAnalyticsSummaryDto,
      | 'automationAnalytics'
      | 'campaignPerformance'
      | 'dailyTrends'
      | 'trendFromDate'
      | 'trendToDate'
      | 'slaAnalytics'
      | 'totalLeadCount'
      | 'examScheduledLeadCount'
      | 'eligibilityHandoffCount'
      | 'staleOrArchivedLeadCount'
      | 'duplicateWarningCount'
      | 'examScheduledRate'
      | 'eligibilityHandoffRate'
      | 'staleOrArchivedRate'
      | 'duplicateWarningRate'
    > = {
      trendFromDate: '2026-07-01T00:00:00',
      trendToDate: '2026-07-10T00:00:00',
      totalLeadCount: 2,
      examScheduledLeadCount: 1,
      eligibilityHandoffCount: 1,
      staleOrArchivedLeadCount: 0,
      duplicateWarningCount: 1,
      examScheduledRate: 50,
      eligibilityHandoffRate: 50,
      staleOrArchivedRate: 0,
      duplicateWarningRate: 50,
      slaAnalytics: {
        firstResponseSlaHours: 24,
        firstResponseCount: 1,
        firstResponsePendingCount: 1,
        firstResponseSlaMetCount: 1,
        firstResponseSlaMissedCount: 0,
        firstResponseRate: 50,
        firstResponseSlaMetRate: 100,
        firstResponseSlaMissedRate: 0,
        averageFirstResponseHours: 1.25,
        followUpSlaMissedCount: 1,
        followUpSlaMissedRate: 50,
      },
      automationAnalytics: {
        runCount: 2,
        failedRunCount: 1,
        failureCount: 1,
        recentRuns: [
          {
            id: 'run-1',
            runType: AdmissionCrmAutomationRunType.Journey,
            status: AdmissionCrmAutomationRunStatus.CompletedWithFailures,
            trigger: AdmissionCrmJourneyTrigger.ExamScheduled,
            stage: AdmissionInquiryStage.ExamScheduled,
            leadId: 'lead-1',
            startedAt: '2026-07-10T08:59:00Z',
            completedAt: '2026-07-10T09:00:00Z',
            evaluatedLeadCount: 1,
            matchedRuleCount: 1,
            createdTaskCount: 0,
            sentMessageCount: 0,
            skippedExistingTaskCount: 0,
            skippedExistingMessageCount: 0,
            failedActionCount: 1,
            markedStaleCount: 0,
            archivedCount: 0,
            details: 'Journey ExamScheduled evaluated 1 lead(s).',
          },
        ],
        recentFailures: [
          {
            eventId: 'event-1',
            leadId: 'lead-1',
            title: 'Automation action failed',
            details: 'Journey rule could not send the configured template.',
            occurredAt: '2026-07-10T09:00:00Z',
          },
        ],
      },
      campaignPerformance: [
        {
          campaignName: 'Scholarship Drive',
          leadCount: 2,
          examScheduledCount: 1,
          eligibleCount: 1,
          waitlistedCount: 0,
          rejectedCount: 0,
          eligibilityRate: 50,
          averageLeadScore: 72.5,
        },
      ],
      dailyTrends: [
        {
          date: '2026-07-10T00:00:00',
          leadCount: 2,
          examScheduledCount: 1,
          examCompletedCount: 1,
          eligibleCount: 1,
          waitlistedCount: 0,
          rejectedCount: 0,
          staleCount: 0,
          archivedCount: 0,
          slaMissedCount: 1,
        },
      ],
    };

    expect(analytics.automationAnalytics.runCount).toBe(2);
    expect(analytics.automationAnalytics.failedRunCount).toBe(1);
    expect(analytics.automationAnalytics.failureCount).toBe(1);
    expect(analytics.automationAnalytics.recentRuns[0]).toMatchObject({
      id: 'run-1',
      runType: AdmissionCrmAutomationRunType.Journey,
      status: AdmissionCrmAutomationRunStatus.CompletedWithFailures,
    });
    expect(analytics.automationAnalytics.recentFailures[0]).toMatchObject({
      eventId: 'event-1',
      leadId: 'lead-1',
    });
    expect(analytics.campaignPerformance[0]).toMatchObject({
      campaignName: 'Scholarship Drive',
      averageLeadScore: 72.5,
    });
    expect(analytics.dailyTrends[0]).toMatchObject({
      leadCount: 2,
      slaMissedCount: 1,
    });
    expect(analytics).toMatchObject({
      examScheduledRate: 50,
      eligibilityHandoffRate: 50,
      duplicateWarningRate: 50,
      slaAnalytics: {
        firstResponseSlaMetRate: 100,
        followUpSlaMissedRate: 50,
      },
    });
  });

  it('keeps automation failure detail shape in the summary contract', () => {
    const automationAnalytics: AdmissionCrmAnalyticsSummaryDto['automationAnalytics'] = {
      runCount: 1,
      failedRunCount: 1,
      failureCount: 1,
      recentRuns: [
        {
          id: 'run-1',
          runType: AdmissionCrmAutomationRunType.Journey,
          status: AdmissionCrmAutomationRunStatus.CompletedWithFailures,
          trigger: AdmissionCrmJourneyTrigger.ExamScheduled,
          stage: AdmissionInquiryStage.ExamScheduled,
          leadId: 'lead-1',
          startedAt: '2026-07-10T08:59:00Z',
          completedAt: '2026-07-10T09:00:00Z',
          evaluatedLeadCount: 1,
          matchedRuleCount: 1,
          createdTaskCount: 0,
          sentMessageCount: 0,
          skippedExistingTaskCount: 0,
          skippedExistingMessageCount: 0,
          failedActionCount: 1,
          markedStaleCount: 0,
          archivedCount: 0,
          details: 'Journey ExamScheduled evaluated 1 lead(s).',
        },
      ],
      recentFailures: [
        {
          eventId: 'event-1',
          leadId: 'lead-1',
          title: 'Automation action failed',
          details: 'Journey rule could not send the configured template.',
          occurredAt: '2026-07-10T09:00:00Z',
        },
      ],
    };

    expect(automationAnalytics.runCount).toBe(1);
    expect(automationAnalytics.recentRuns[0]).toMatchObject({
      id: 'run-1',
      status: AdmissionCrmAutomationRunStatus.CompletedWithFailures,
    });
    expect(automationAnalytics.failureCount).toBe(1);
    expect(automationAnalytics.recentFailures[0]).toMatchObject({
      eventId: 'event-1',
      leadId: 'lead-1',
    });
  });
});
