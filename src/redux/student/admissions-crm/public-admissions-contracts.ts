import type { FetchArgs } from '@reduxjs/toolkit/query';

import { ApplyAdmissionCrmDeliveryCallbackDto } from './communication-exams-events-contracts';

export const buildSavePublicAdmissionCrmRegistrationRequest = ({
  tenantId,
  token,
  body,
}: {
  tenantId: string;
  token: string;
  body: {
    accessSessionToken: string;
    concurrencyStamp: string;
    responses: Record<string, unknown>;
  };
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration`,
  method: 'PUT',
  body,
});

export const buildPublicAdmissionCrmDocumentUploadUrl = ({
  tenantId,
  token,
}: {
  tenantId: string;
  token: string;
}) =>
  `/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration/documents`;

export const buildPublicAdmissionCrmDeliveryCallbackRequest = ({
  tenantId,
  deliveryLogId,
  body,
}: {
  tenantId: string;
  deliveryLogId: string;
  body: ApplyAdmissionCrmDeliveryCallbackDto;
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/communication/delivery-logs/${deliveryLogId}/callback`,
  method: 'POST',
  body,
});

export const buildPublicAdmissionCrmFormRequest = ({
  tenantId,
  templateId,
  language,
}: {
  tenantId: string;
  templateId: string;
  language?: 'en' | 'gu' | 'hi';
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/forms/${templateId}`,
  method: 'GET',
  ...(language ? { params: { language } } : {}),
});
