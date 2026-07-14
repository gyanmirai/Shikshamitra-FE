import { it, expect, describe } from 'vitest';

import {
  getCrmUserLabel,
  getCrmUserOptionLabel,
  buildCrmUserSelectOptions,
  getAdmissionCrmProviderAdapter,
  buildPublicAdmissionInquiryUrl,
  buildPublicAdmissionInquiryPath,
  parseAdmissionCrmProviderSettings,
  updateAdmissionCrmProviderAdapter,
  getAdmissionCrmProviderPayloadMode,
  updateAdmissionCrmProviderPayloadMode,
  getAdmissionCrmProviderCallbackSecret,
  getAdmissionCrmProviderKeyValueSettings,
  updateAdmissionCrmProviderCallbackSecret,
  updateAdmissionCrmProviderKeyValueSettings,
  getAdmissionCrmProviderCallbackMappingPath,
  buildAdmissionCrmProviderDeliveryCallbackUrl,
  getAdmissionCrmProviderResponseMessageIdPath,
  buildAdmissionCrmProviderDeliveryCallbackPath,
  updateAdmissionCrmProviderCallbackMappingPath,
  updateAdmissionCrmProviderResponseMessageIdPath,
} from './admissions-crm-configuration-utils';

describe('Admissions CRM configuration helpers', () => {
  it('builds public inquiry paths from tenant and template IDs', () => {
    expect(buildPublicAdmissionInquiryPath('tenant-1', 'template-1')).toBe(
      '/student/admissions/inquiry/tenant-1/template-1'
    );
  });

  it('builds absolute public inquiry URLs with a normalized origin', () => {
    expect(
      buildPublicAdmissionInquiryUrl({
        origin: 'https://school.example/',
        tenantId: 'tenant-1',
        templateId: 'template-1',
      })
    ).toBe('https://school.example/student/admissions/inquiry/tenant-1/template-1');
  });

  it('builds campaign-specific public inquiry URLs', () => {
    expect(
      buildPublicAdmissionInquiryUrl({
        origin: 'https://school.example/',
        tenantId: 'tenant-1',
        templateId: 'template-1',
        campaignName: 'Monsoon QR Drive',
      })
    ).toBe(
      'https://school.example/student/admissions/inquiry/tenant-1/template-1?campaignName=Monsoon+QR+Drive'
    );
  });

  it('builds staff-shared public inquiry URLs', () => {
    expect(
      buildPublicAdmissionInquiryUrl({
        origin: 'https://school.example/',
        tenantId: 'tenant-1',
        templateId: 'template-1',
        campaignName: 'Open Day',
        ownerUserId: '  owner-1  ',
      })
    ).toBe(
      'https://school.example/student/admissions/inquiry/tenant-1/template-1?campaignName=Open+Day&ownerUserId=owner-1'
    );
  });

  it('builds campaign-specific public inquiry paths without an origin', () => {
    expect(
      buildPublicAdmissionInquiryUrl({
        origin: null,
        tenantId: 'tenant-1',
        templateId: 'template-1',
        campaignName: '  Staff Fair Booth  ',
      })
    ).toBe('/student/admissions/inquiry/tenant-1/template-1?campaignName=Staff+Fair+Booth');
  });

  it('returns null when tenant or template context is missing', () => {
    expect(buildPublicAdmissionInquiryPath(null, 'template-1')).toBeNull();
    expect(
      buildPublicAdmissionInquiryUrl({
        origin: 'https://school.example',
        tenantId: 'tenant-1',
        templateId: null,
      })
    ).toBeNull();
  });

  it('builds provider callback paths from tenant, academic year, and channel', () => {
    expect(
      buildAdmissionCrmProviderDeliveryCallbackPath({
        tenantId: 'tenant 1',
        academicYearId: 'year-1',
        channel: 0,
      })
    ).toBe(
      '/api/public/student-enrollment/admissions-crm/tenant%201/communication/year-1/0/delivery-callback'
    );
  });

  it('builds absolute provider callback URLs with a normalized API origin', () => {
    expect(
      buildAdmissionCrmProviderDeliveryCallbackUrl({
        apiOrigin: 'https://api.school.example/',
        tenantId: 'tenant-1',
        academicYearId: 'year-1',
        channel: '2',
      })
    ).toBe(
      'https://api.school.example/api/public/student-enrollment/admissions-crm/tenant-1/communication/year-1/2/delivery-callback'
    );
    expect(
      buildAdmissionCrmProviderDeliveryCallbackUrl({
        apiOrigin: 'https://api.school.example',
        tenantId: 'tenant-1',
        academicYearId: null,
        channel: 2,
      })
    ).toBeNull();
  });

  it('labels users from display name, username, email, or id', () => {
    expect(getCrmUserOptionLabel({ id: 'user-1', name: 'Asha', surname: 'Shah' })).toBe(
      'Asha Shah'
    );
    expect(getCrmUserOptionLabel({ id: 'user-2', userName: 'principal' })).toBe('principal');
    expect(getCrmUserOptionLabel({ id: 'user-3', email: 'staff@example.test' })).toBe(
      'staff@example.test'
    );
    expect(getCrmUserOptionLabel({ id: 'user-4' })).toBe('user-4');
  });

  it('sorts users and preserves unknown selected owner IDs', () => {
    const options = buildCrmUserSelectOptions(
      [
        { id: 'user-2', name: 'Zara' },
        { id: 'user-1', name: 'Asha' },
      ],
      ['user-1', 'legacy-owner-id', 'legacy-owner-id']
    );

    expect(options.map((option) => option.id)).toEqual(['user-1', 'user-2', 'legacy-owner-id']);
    expect(getCrmUserLabel(options, 'legacy-owner-id')).toBe('Unknown user (legacy-o)');
  });

  it('updates provider adapter settings while preserving provider JSON fields', () => {
    const updated = updateAdmissionCrmProviderAdapter(
      JSON.stringify({
        responseProviderMessageIdPath: 'data.messageId',
        headers: { 'X-School': 'admission' },
      }),
      'manual'
    );

    expect(getAdmissionCrmProviderAdapter(updated)).toBe('manual');
    expect(getAdmissionCrmProviderResponseMessageIdPath(updated)).toBe('data.messageId');
    expect(parseAdmissionCrmProviderSettings(updated).headers).toEqual({
      'X-School': 'admission',
    });
  });

  it('keeps an explicit webhook adapter and removes blank provider response ID paths', () => {
    const withoutAdapter = updateAdmissionCrmProviderAdapter(
      JSON.stringify({ adapter: 'manual', responseProviderMessageIdPath: 'messages.0.id' }),
      'webhook'
    );
    const withoutResponsePath = updateAdmissionCrmProviderResponseMessageIdPath(
      withoutAdapter,
      ' '
    );

    expect(getAdmissionCrmProviderAdapter(withoutResponsePath)).toBe('webhook');
    expect(getAdmissionCrmProviderResponseMessageIdPath(withoutResponsePath)).toBe('');
    expect(parseAdmissionCrmProviderSettings(withoutResponsePath).adapter).toBe('webhook');
    expect(parseAdmissionCrmProviderSettings(withoutResponsePath)).not.toHaveProperty(
      'responseProviderMessageIdPath'
    );
  });

  it('updates structured payload, header, and parameter settings', () => {
    const withPayload = updateAdmissionCrmProviderPayloadMode('{}', 'envelope');
    const withHeaders = updateAdmissionCrmProviderKeyValueSettings(withPayload, 'headers', {
      Authorization: 'Bearer token',
    });
    const withParameters = updateAdmissionCrmProviderKeyValueSettings(withHeaders, 'parameters', {
      language: 'en',
    });

    expect(getAdmissionCrmProviderPayloadMode(withParameters)).toBe('envelope');
    expect(getAdmissionCrmProviderKeyValueSettings(withParameters, 'headers')).toEqual({
      Authorization: 'Bearer token',
    });
    expect(getAdmissionCrmProviderKeyValueSettings(withParameters, 'parameters')).toEqual({
      language: 'en',
    });
  });

  it('updates provider callback secret and mapping paths while preserving settings', () => {
    const withSecret = updateAdmissionCrmProviderCallbackSecret(
      JSON.stringify({
        adapter: 'custom-webhook',
        parameters: { templateLanguage: 'en' },
      }),
      'crm-secret'
    );
    const withStatusPath = updateAdmissionCrmProviderCallbackMappingPath(
      withSecret,
      'statusPath',
      'event.status'
    );
    const withMessagePath = updateAdmissionCrmProviderCallbackMappingPath(
      withStatusPath,
      'providerMessageIdPath',
      'message.id'
    );

    expect(getAdmissionCrmProviderCallbackSecret(withMessagePath)).toBe('crm-secret');
    expect(getAdmissionCrmProviderCallbackMappingPath(withMessagePath, 'statusPath')).toBe(
      'event.status'
    );
    expect(
      getAdmissionCrmProviderCallbackMappingPath(withMessagePath, 'providerMessageIdPath')
    ).toBe('message.id');
    expect(parseAdmissionCrmProviderSettings(withMessagePath).adapter).toBe('custom-webhook');
    expect(parseAdmissionCrmProviderSettings(withMessagePath).parameters).toEqual({
      templateLanguage: 'en',
    });
  });

  it('removes blank provider callback secret and mapping paths', () => {
    const initial = JSON.stringify({
      callbackSecret: 'crm-secret',
      callbackMappings: {
        statusPath: 'event.status',
      },
    });
    const withoutSecret = updateAdmissionCrmProviderCallbackSecret(initial, '');
    const withoutMapping = updateAdmissionCrmProviderCallbackMappingPath(
      withoutSecret,
      'statusPath',
      ''
    );

    expect(getAdmissionCrmProviderCallbackSecret(withoutMapping)).toBe('');
    expect(getAdmissionCrmProviderCallbackMappingPath(withoutMapping, 'statusPath')).toBe('');
    expect(parseAdmissionCrmProviderSettings(withoutMapping)).not.toHaveProperty('callbackSecret');
    expect(parseAdmissionCrmProviderSettings(withoutMapping)).not.toHaveProperty(
      'callbackMappings'
    );
  });
});
