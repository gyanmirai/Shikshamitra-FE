/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { PublicAdmissionsCrmApi } from './public-admissions-api';

import {
  buildPublicAdmissionCrmDocumentUploadUrl,
  buildPublicAdmissionCrmFormRequest,
  buildSavePublicAdmissionCrmRegistrationRequest,
} from './public-admissions-contracts';

describe('public-admissions admissions CRM API contracts', () => {
  it('builds registration configuration and secure applicant requests', () => {
    expect(
      buildSavePublicAdmissionCrmRegistrationRequest({
        tenantId: 'tenant-1',
        token: 'status-token',
        accessSessionToken: 'session-token',
        body: {
          concurrencyStamp: 'version-1',
          responses: { firstName: 'Aarav' },
        },
      })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/status/status-token/registration',
      method: 'PUT',
      headers: { 'X-Admission-Access-Session': 'session-token' },
      body: {
        concurrencyStamp: 'version-1',
        responses: { firstName: 'Aarav' },
      },
    });
  });

  it('builds document checklist and applicant upload routes', () => {
    expect(
      buildPublicAdmissionCrmDocumentUploadUrl({ tenantId: 'tenant-1', token: 'status-token' })
    ).toBe(
      '/public/student-enrollment/admissions-crm/tenant-1/status/status-token/registration/documents'
    );
  });

  it('builds the public form route request', () => {
    expect(
      buildPublicAdmissionCrmFormRequest({ tenantId: 'tenant-1', templateId: 'template-1' })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/forms/template-1',
      method: 'GET',
    });
  });

  it('registers the browser-safe public form endpoint only', () => {
    expect(PublicAdmissionsCrmApi.endpoints.getPublicAdmissionCrmForm).toBeTruthy();
  });
});
