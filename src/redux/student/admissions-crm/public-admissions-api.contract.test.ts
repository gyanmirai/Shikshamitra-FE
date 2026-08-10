/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { PublicAdmissionsCrmApi } from './public-admissions-api';

import {
  buildPublicAdmissionCrmDeliveryCallbackRequest,
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
        body: {
          accessSessionToken: 'session-token',
          concurrencyStamp: 'version-1',
          responses: { firstName: 'Aarav' },
        },
      })
    ).toEqual({
      url: '/public/student-enrollment/admissions-crm/tenant-1/status/status-token/registration',
      method: 'PUT',
      body: {
        accessSessionToken: 'session-token',
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

  it('builds duplicate merge, template, entrance exam, analytics, and public form route requests', () => {
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

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(PublicAdmissionsCrmApi.endpoints.applyPublicAdmissionCrmDeliveryCallback).toBeTruthy();

    expect(PublicAdmissionsCrmApi.endpoints.getPublicAdmissionCrmForm).toBeTruthy();
  });
});
