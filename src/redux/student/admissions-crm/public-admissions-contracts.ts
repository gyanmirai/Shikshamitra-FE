import type { FetchArgs } from '@reduxjs/toolkit/query';

export const buildSavePublicAdmissionCrmRegistrationRequest = ({
  tenantId,
  token,
  accessSessionToken,
  body,
}: {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  body: {
    concurrencyStamp: string;
    responses: Record<string, unknown>;
  };
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration`,
  method: 'PUT',
  headers: { 'X-Admission-Access-Session': accessSessionToken },
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
