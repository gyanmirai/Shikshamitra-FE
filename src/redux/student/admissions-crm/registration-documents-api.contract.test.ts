/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionCrmRegistrationDocumentsApi } from './registration-documents-api';

import {
  buildAdmissionCrmDocumentChecklistTemplateListRequest,
  buildAdmissionCrmFormNumberSeriesListRequest,
  buildAdmissionCrmRegistrationTemplateListRequest,
  buildAssignAdmissionCrmDocumentChecklistRequest,
  buildCreateAdmissionCrmRegistrationTemplateRequest,
  buildIssueAdmissionCrmRegistrationApplicationRequest,
  buildIssueAdmissionCrmRegistrationFormRequest,
} from './registration-documents-contracts';

describe('registration-documents admissions CRM API contracts', () => {
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
          accessMode: 0,
          formNumberSeriesId: 'series-1',
          waiveFee: false,
        },
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/registrations/issue',
      method: 'POST',
      body: {
        registrationTemplateId: 'template-1',
        accessMode: 0,
        formNumberSeriesId: 'series-1',
        waiveFee: false,
      },
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
  });

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
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
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.issueAdmissionCrmRegistrationForm
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.getCurrentAdmissionCrmRegistrationByLead
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.sendAdmissionCrmRegistrationInvitation
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.returnAdmissionCrmRegistrationForCorrection
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.verifyAdmissionCrmRegistration
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.extendAdmissionCrmRegistration
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.reissueAdmissionCrmRegistration
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.uploadAdmissionCrmRegistrationDocument
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.reviewAdmissionCrmApplicantDocument
    ).toBeTruthy();

    expect(
      AdmissionCrmRegistrationDocumentsApi.endpoints.waiveAdmissionCrmApplicantDocument
    ).toBeTruthy();
  });
});
