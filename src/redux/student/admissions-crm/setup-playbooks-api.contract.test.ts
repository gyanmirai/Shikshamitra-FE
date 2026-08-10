/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionCrmJourneyTrigger } from './core-leads-contracts';

import { AdmissionCrmRegistrationPath } from './registration-documents-contracts';

import { AdmissionCrmSetupPlaybooksApi } from './setup-playbooks-api';

import {
  AdmissionCrmPlaybookStatus,
  buildAdmissionCrmJourneyRulesRunRequest,
  buildAdmissionCrmPlaybookListRequest,
  buildAdmissionCrmSchoolDefaultCycleConfigurationRequest,
  buildCreateAdmissionCrmPlaybookRequest,
  buildGenerateAdmissionCrmPlaybookSlotsRequest,
  buildRecommendAdmissionCrmPlaybookSlotRequest,
  buildResolveAdmissionCrmPlaybookRequest,
  buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest,
} from './setup-playbooks-contracts';

describe('setup-playbooks admissions CRM API contracts', () => {
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
  });

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
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
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(AdmissionCrmSetupPlaybooksApi.endpoints.getAdmissionCrmCycleConfiguration).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.updateAdmissionCrmCycleConfiguration
    ).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.getAdmissionCrmConfigurationReferences
    ).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.previewAdmissionCrmConfigurationImpact
    ).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.previewAdmissionCrmConfigurationClone
    ).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.confirmAdmissionCrmConfigurationClone
    ).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.getAdmissionCrmPipelineStages).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.createAdmissionCrmPipelineStage).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.getAdmissionCrmFormTemplates).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.createAdmissionCrmFormTemplate).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.updateAdmissionCrmFormTemplate).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.updateAdmissionCrmFormTemplateStatus
    ).toBeTruthy();

    expect(AdmissionCrmSetupPlaybooksApi.endpoints.runAdmissionCrmJourneyRules).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.getAdmissionCrmSchoolDefaultCycleConfiguration
    ).toBeTruthy();

    expect(
      AdmissionCrmSetupPlaybooksApi.endpoints.updateAdmissionCrmSchoolDefaultCycleConfiguration
    ).toBeTruthy();
  });
});
