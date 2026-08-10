/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionCrmCommunicationExamsEventsApi } from './communication-exams-events-api';

import {
  AdmissionCrmEventStatus,
  AdmissionCrmEventType,
  AdmissionCrmExamReadinessField,
  AdmissionCrmMessageChannel,
  AdmissionCrmTimelineEventType,
  buildAdmissionCrmCommunicationOptOutListRequest,
  buildAdmissionCrmCommunicationProvidersRequest,
  buildAdmissionCrmEventListRequest,
  buildAdmissionCrmExamListRequest,
  buildAdmissionCrmMessageDeliveryLogListRequest,
  buildAdmissionCrmMessageTemplateListRequest,
  buildBulkAdmissionCrmExamResultsRequest,
  buildCreateAdmissionCrmEventRequest,
  buildPreviewAdmissionCrmExamResultRequest,
  buildPreviewAdmissionCrmMessageTemplateRequest,
  buildReserveAdmissionCrmEventRequest,
  buildScheduleAdmissionCrmExamRequest,
  buildSendAdmissionCrmTemplateMessageRequest,
  buildUpdateAdmissionCrmCommunicationProviderRequest,
} from './communication-exams-events-contracts';

describe('communication-exams-events admissions CRM API contracts', () => {
  it('builds admissions event lifecycle and roster requests', () => {
    expect(
      buildAdmissionCrmEventListRequest({
        academicYearId: 'year-1',
        status: AdmissionCrmEventStatus.Published,
        eventType: AdmissionCrmEventType.OpenHouse,
        maxResultCount: 25,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/events',
      params: {
        status: AdmissionCrmEventStatus.Published,
        eventType: AdmissionCrmEventType.OpenHouse,
        maxResultCount: 25,
      },
    });

    const body = {
      title: 'Primary school open house',
      eventType: AdmissionCrmEventType.OpenHouse,
      startsAt: '2026-08-15T04:30:00.000Z',
      endsAt: '2026-08-15T06:30:00.000Z',
      location: 'Main campus',
      capacity: 100,
    };

    expect(buildCreateAdmissionCrmEventRequest({ academicYearId: 'year-1', body })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/events',
      method: 'POST',
      body,
    });

    expect(buildReserveAdmissionCrmEventRequest({ eventId: 'event-1', leadId: 'lead-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/events/event-1/registrations',
      method: 'POST',
      body: { leadId: 'lead-1', notes: undefined },
    });
  });

  it('builds versioned admissions playbook requests in the CRM route family', () => {
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

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
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
    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmMessageTemplates
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.createAdmissionCrmMessageTemplate
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmCommunicationProviders
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.updateAdmissionCrmCommunicationProvider
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmCommunicationOptOuts
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.sendAdmissionCrmTemplateMessage
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.previewAdmissionCrmMessageTemplate
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmMessageDeliveryLogs
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.retryAdmissionCrmMessageDelivery
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmEntranceExams
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.getAdmissionCrmEligibilityHandoff
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.scheduleAdmissionCrmEntranceExam
    ).toBeTruthy();

    expect(
      AdmissionCrmCommunicationExamsEventsApi.endpoints.bulkUploadAdmissionCrmExamResults
    ).toBeTruthy();
  });

  it('keeps the default exam readiness bitmask aligned with the backend contract', () => {
    expect(
      AdmissionCrmExamReadinessField.Contact |
        AdmissionCrmExamReadinessField.AdmissionIntent |
        AdmissionCrmExamReadinessField.DesiredClass
    ).toBe(7);
  });

  it('keeps lead priority enum values aligned with the backend contract', () => {
    expect(AdmissionCrmTimelineEventType.PriorityChanged).toBe(19);
  });

  it('keeps timeline event enum values aligned with the backend contract', () => {
    expect(AdmissionCrmTimelineEventType.AutomationFailed).toBe(16);

    expect(AdmissionCrmTimelineEventType.StageChanged).toBe(17);

    expect(AdmissionCrmTimelineEventType.NoteAdded).toBe(18);

    expect(AdmissionCrmTimelineEventType.PriorityChanged).toBe(19);

    expect(AdmissionCrmTimelineEventType.RegistrationFormIssued).toBe(20);

    expect(AdmissionCrmTimelineEventType.ApplicantChecklistUpdated).toBe(21);
  });
});
