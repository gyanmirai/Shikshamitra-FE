/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionCrmCoreLeadsApi } from './core-leads-api';

import {
  AdmissionCrmApplicantChecklistItemDto,
  AdmissionCrmApplicantChecklistProgressDto,
  AdmissionCrmApplicantChecklistProgressStatus,
  AdmissionCrmFormFieldDto,
  AdmissionCrmFormFieldType,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmLeadPriority,
  AdmissionCrmLeadRoutingStrategy,
  AdmissionInquiryChannel,
  AdmissionInquiryStage,
  buildAddAdmissionCrmLeadNoteRequest,
  buildAdmissionCrmDecisionHistoryRequest,
  buildAdmissionCrmLeadApplicantChecklistRequest,
  buildAdmissionCrmLeadListRequest,
  buildAdmissionCrmQuickInquiryOptionsRequest,
  buildAdmissionCrmSlaReminderRunRequest,
  buildAdmissionCrmTimelineRequest,
  buildChangeAdmissionCrmLeadPriorityRequest,
  buildChangeAdmissionCrmLeadStageRequest,
  buildCreateAdmissionCrmLeadRequest,
  buildMergeAdmissionCrmDuplicateLeadRequest,
  buildPreviewAdmissionCrmLeadDuplicatesRequest,
  buildUpdateAdmissionCrmLeadApplicantChecklistRequest,
} from './core-leads-contracts';

import {
  AdmissionCrmAnalyticsSummaryDto,
  AdmissionCrmAutomationRunStatus,
  AdmissionCrmAutomationRunType,
  AdmissionCrmEnrollmentOverviewDto,
} from './operations-governance-contracts';

import {
  AdmissionCrmChannelSettingDto,
  AdmissionCrmFormTemplateDto,
  AdmissionCrmLeadRoutingRuleDto,
} from './setup-playbooks-contracts';

describe('core-leads admissions CRM API contracts', () => {
  it('builds final-admission seat, offer, and decision requests', () => {
    expect(buildAdmissionCrmDecisionHistoryRequest({ leadId: 'lead-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/final-admission/decisions',
      method: 'GET',
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
      buildMergeAdmissionCrmDuplicateLeadRequest({
        leadId: 'lead-1',
        body: { duplicateLeadId: 'lead-2', reason: 'Same parent contact.' },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/duplicates/merge',
      method: 'POST',
      body: { duplicateLeadId: 'lead-2', reason: 'Same parent contact.' },
    });

    expect(buildAdmissionCrmSlaReminderRunRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/automation/sla-reminders/run',
      method: 'POST',
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
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(AdmissionCrmCoreLeadsApi.endpoints.getAdmissionCrmLeads).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.createAdmissionCrmLead).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.mergeAdmissionCrmDuplicateLead).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.changeAdmissionCrmLeadPriority).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.lockAdmissionCrmJourney).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.unlockAdmissionCrmJourney).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.createAdmissionCrmInquirySource).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.updateAdmissionCrmInquirySource).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.setAdmissionCrmInquirySourceStatus).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.createAdmissionCrmTask).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.runAdmissionCrmSlaReminders).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.getAdmissionCrmSlaHolds).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.createAdmissionCrmSlaHold).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.resumeAdmissionCrmSlaHold).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.getAdmissionCrmTimeline).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.getAdmissionCrmLeadApplicantChecklist).toBeTruthy();

    expect(
      AdmissionCrmCoreLeadsApi.endpoints.updateAdmissionCrmLeadApplicantChecklist
    ).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.addAdmissionCrmLeadNote).toBeTruthy();

    expect(AdmissionCrmCoreLeadsApi.endpoints.confirmAdmissionCrmDocumentReadiness).toBeTruthy();
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

    expect(automationAnalytics.failureCount).toBe(1);

    expect(automationAnalytics.recentRuns[0]).toMatchObject({
      id: 'run-1',
      status: AdmissionCrmAutomationRunStatus.CompletedWithFailures,
    });

    expect(automationAnalytics.recentFailures[0]).toMatchObject({
      eventId: 'event-1',
      leadId: 'lead-1',
    });
  });
});
