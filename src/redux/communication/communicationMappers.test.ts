import { it, expect, describe } from 'vitest';

import {
  CommunicationChannelType,
  CommunicationDeliveryStatus,
  CommunicationProviderStatus,
  CommunicationTemplateApprovalStatus,
} from './communicationTypes';
import {
  channelLabel,
  toChannelValue,
  mapTemplateFormToPayload,
  getProviderInitialValues,
  mapProviderFormToPayload,
  mapNotificationDraftPayload,
  mapDeliveryAttemptToHistoryRow,
} from './communicationMappers';

describe('communication mappers', () => {
  it('loads and saves Meta WhatsApp IDs as strings with the existing backend schema', () => {
    const provider = {
      id: 'provider-1',
      channel: CommunicationChannelType.WhatsApp,
      providerName: 'Meta WhatsApp Cloud API',
      isEnabled: true,
      isDefault: true,
      consentRequired: true,
      templateApprovalRequired: true,
      fallbackOrder: [CommunicationChannelType.InApp],
      status: CommunicationProviderStatus.Enabled,
      secretReference: 'academic-pilot',
      configurationJson: '{"schemaVersion":1,"businessAccountId":"12345678901234567890","phoneNumberId":"0123456789"}',
    };
    const values = getProviderInitialValues(provider);
    expect(values).toMatchObject({
      businessAccountId: '12345678901234567890',
      phoneNumberId: '0123456789',
    });
    const saved = mapProviderFormToPayload({ ...values, phoneNumberId: '9876543210' }, provider);
    expect(saved.configurationJson).toBe(
      '{"schemaVersion":1,"businessAccountId":"12345678901234567890","phoneNumberId":"9876543210"}'
    );
    expect(saved.secretReference).toBe('academic-pilot');
  });

  it('preserves provider-specific settings on ordinary updates', () => {
    const provider = {
      id: 'provider-2',
      ...getProviderInitialValues(),
      channel: CommunicationChannelType.Email,
      providerName: 'SMTP',
      configurationJson: '{"relay":"shared-staging"}',
      dailyQuota: null,
      monthlyQuota: null,
    };
    const mapped = mapProviderFormToPayload({ ...getProviderInitialValues(provider), isEnabled: false }, provider);
    expect(mapped.configurationJson).toBe(provider.configurationJson);
  });

  it('keeps persisted channel values stable and distinguishes website push from the inbox', () => {
    expect(CommunicationChannelType.WhatsApp).toBe(0);
    expect(CommunicationChannelType.Sms).toBe(1);
    expect(CommunicationChannelType.Email).toBe(2);
    expect(CommunicationChannelType.InApp).toBe(3);
    expect(CommunicationChannelType[4]).toBe('WebPush');
    expect(toChannelValue('Website push')).toBe(4);
    expect(toChannelValue('WebPush')).toBe(4);
    expect(channelLabel(4)).toBe('Website push');
  });
  it('normalizes channel labels and values', () => {
    expect(toChannelValue('SMS')).toBe(CommunicationChannelType.Sms);
    expect(toChannelValue('In-App')).toBe(CommunicationChannelType.InApp);
    expect(toChannelValue('push notification')).toBe(CommunicationChannelType.InApp);
    expect(channelLabel(CommunicationChannelType.WhatsApp)).toBe('WhatsApp');
  });

  it('maps template form values to canonical template payload', () => {
    const payload = mapTemplateFormToPayload(
      {
        templateName: 'Fee Reminder',
        targetRole: 'Parent',
        category: 'Finance',
        subject: 'Fee reminder',
        message: 'Dear {{parentName}}, pay {{amount}}.',
        hashtags: ['finance'],
        languageCode: 'en',
        channels: ['SMS', CommunicationChannelType.InApp],
        approvalStatus: CommunicationTemplateApprovalStatus.Draft,
      },
      'medium-1'
    );

    expect(payload).toMatchObject({
      academicMediumId: 'medium-1',
      body: 'Dear {{parentName}}, pay {{amount}}.',
      channels: [CommunicationChannelType.Sms, CommunicationChannelType.InApp],
      variables: ['parentName', 'amount'],
      hashtags: ['finance'],
    });
  });

  it('omits non-guid audience member ids from notification drafts', () => {
    const payload = mapNotificationDraftPayload({
      audience: { educationMediumStageId: ['stage-1'] },
      channels: [],
      members: [
        {
          id: '0',
          isSelect: true,
          name: 'Parent One',
          contactNumber: '9999999999',
          type: 'ParentGuardian',
        },
      ],
      selectedTemplate: {
        id: '',
        templateName: '',
        hashtags: [],
        targetRole: '',
        subject: 'Hello',
        message: 'Message body',
        importance_level: 'normal',
      },
    });

    expect(payload.members).toHaveLength(1);
    expect(payload.members[0]).not.toHaveProperty('id');
    expect(payload.members[0]).toMatchObject({
      name: 'Parent One',
      mobileNumber: '9999999999',
    });
  });

  it('maps delivery attempts to history rows', () => {
    const row = mapDeliveryAttemptToHistoryRow({
      id: 'attempt-1',
      campaignId: '01234567-89ab-cdef-0123-456789abcdef',
      channel: CommunicationChannelType.Email,
      destination: 'parent@example.com',
      status: CommunicationDeliveryStatus.Skipped,
      providerName: 'Internal',
      providerMessageId: null,
      attemptNumber: 1,
      errorCode: 'CONSENT_REQUIRED',
      errorMessage: 'Consent required',
      queuedAt: '2026-06-17T10:00:00Z',
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      estimatedCost: 0,
      currencyCode: 'INR',
    });

    expect(row).toMatchObject({
      title: 'Campaign 01234567',
      channels: ['Email'],
      status: CommunicationDeliveryStatus.Skipped,
      failed: 1,
      body: 'Consent required',
    });
  });
});
