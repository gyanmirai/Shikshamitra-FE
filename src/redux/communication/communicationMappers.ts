import type { INotification } from 'src/screens/communication/NotificationHistory/type';
import type { INotificationTemplateFormValues } from 'src/screens/communication/settings/Notification/NotificationTemplate/types';
import type {
  IAudienceMember,
  INotificationSendSchema,
} from 'src/screens/communication/settings/Notification/SendNotification/Components/type';

import {
  CommunicationChannelType,
  CommunicationProviderStatus,
  CommunicationImportanceLevel,
  CommunicationTemplateApprovalStatus,
} from './communicationTypes';

import type {
  DeliveryAttemptDto,
  ProviderSettingFormValues,
  ChannelProviderSettingDto,
} from './communicationTypes';

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const communicationChannelOptions = [
  { label: 'WhatsApp', value: CommunicationChannelType.WhatsApp },
  { label: 'SMS', value: CommunicationChannelType.Sms },
  { label: 'Email', value: CommunicationChannelType.Email },
  { label: 'In-App', value: CommunicationChannelType.InApp },
];

export const providerStatusOptions = [
  { label: 'Disabled', value: CommunicationProviderStatus.Disabled },
  { label: 'Enabled', value: CommunicationProviderStatus.Enabled },
  { label: 'Suspended', value: CommunicationProviderStatus.Suspended },
];

export function isGuid(value?: string | null): value is string {
  return !!value && guidPattern.test(value);
}

export function channelLabel(channel?: CommunicationChannelType | string | number | null) {
  const parsed = toChannelValue(channel);

  switch (parsed) {
    case CommunicationChannelType.WhatsApp:
      return 'WhatsApp';
    case CommunicationChannelType.Sms:
      return 'SMS';
    case CommunicationChannelType.Email:
      return 'Email';
    case CommunicationChannelType.InApp:
      return 'In-App';
    default:
      return String(channel ?? '--');
  }
}

export function toChannelValue(
  channel?: CommunicationChannelType | string | number | null
): CommunicationChannelType | undefined {
  if (typeof channel === 'number' && channel in CommunicationChannelType) {
    return channel as CommunicationChannelType;
  }

  const normalized = String(channel ?? '')
    .replace(/[-_\s]/g, '')
    .toLowerCase();

  switch (normalized) {
    case 'whatsapp':
      return CommunicationChannelType.WhatsApp;
    case 'sms':
      return CommunicationChannelType.Sms;
    case 'email':
      return CommunicationChannelType.Email;
    case 'inapp':
    case 'app':
    case 'push':
    case 'pushnotification':
      return CommunicationChannelType.InApp;
    default:
      return undefined;
  }
}

export function providerStatusLabel(status?: CommunicationProviderStatus | number | null) {
  return providerStatusOptions.find((option) => option.value === status)?.label ?? '--';
}

export function extractTemplateVariables(body: string) {
  const variables = new Set<string>();
  const matcher = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  let match = matcher.exec(body);

  while (match) {
    variables.add(match[1]);
    match = matcher.exec(body);
  }

  return Array.from(variables);
}

export function importanceValue(value: unknown): CommunicationImportanceLevel {
  const normalized =
    typeof value === 'object' && value !== null && 'levelName' in value
      ? String((value as { levelName?: unknown }).levelName ?? '')
      : String(value ?? '');

  switch (normalized.toLowerCase()) {
    case 'urgent':
    case 'high':
      return CommunicationImportanceLevel.Urgent;
    case 'critical':
      return CommunicationImportanceLevel.Critical;
    default:
      return CommunicationImportanceLevel.Normal;
  }
}

function selectedMembers(values: INotificationSendSchema): IAudienceMember[] {
  return (values.members || []).filter((member) => member.isSelect);
}

export function mapNotificationDraftPayload(values: INotificationSendSchema) {
  const template = values.selectedTemplate || {};
  const members = selectedMembers(values).map((member: any) => {
    const recipient = {
      name: member.name,
      email: member.email,
      contactNumber: member.contactNumber || member.contactNo,
      mobileNumber: member.mobileNumber || member.contactNumber || member.contactNo,
      type: member.type || member.role || 'ParentGuardian',
    } as Record<string, unknown>;

    if (isGuid(member.id)) {
      recipient.id = member.id;
    }

    return recipient;
  });

  return {
    title: template.subject || template.templateName || 'Notification draft',
    subject: template.subject || template.templateName || 'Notification',
    message: template.message || '',
    languageCode: 'en',
    members,
    selectedTemplate: {
      id: isGuid(template.id) ? template.id : undefined,
      templateName: template.templateName,
      subject: template.subject,
      message: template.message,
    },
    importance_level: template.importance_level,
  };
}

export function mapNotificationChannelsPayload(channels: Array<string | number>) {
  return {
    channels: channels
      .map((channel) => toChannelValue(channel))
      .filter((channel): channel is CommunicationChannelType => channel !== undefined)
      .map(channelLabel),
  };
}

export function mapNotificationMessagePayload(values: INotificationSendSchema) {
  const template = values.selectedTemplate || {};

  return {
    subject: template.subject,
    message: template.message,
    selectedTemplate: {
      id: isGuid(template.id) ? template.id : undefined,
      templateName: template.templateName,
      subject: template.subject,
      message: template.message,
    },
  };
}

export function mapTemplateFormToPayload(
  values: INotificationTemplateFormValues,
  academicMediumId?: string
) {
  const channels =
    values.channels?.length > 0
      ? values.channels
          .map((channel) => toChannelValue(channel))
          .filter((channel): channel is CommunicationChannelType => channel !== undefined)
      : [CommunicationChannelType.InApp];

  return {
    academicMediumId,
    templateName: values.templateName,
    targetRole: values.targetRole,
    category: values.category || 'General',
    subject: values.subject,
    body: values.message,
    languageCode: values.languageCode || 'en',
    channels,
    variables: extractTemplateVariables(values.message),
    hashtags: values.hashtags,
    approvalStatus: values.approvalStatus ?? CommunicationTemplateApprovalStatus.Draft,
    isActive: true,
  };
}

export function getProviderInitialValues(
  setting?: ChannelProviderSettingDto | null
): ProviderSettingFormValues {
  return {
    channel: setting?.channel ?? CommunicationChannelType.InApp,
    providerName: setting?.providerName ?? '',
    senderId: setting?.senderId ?? '',
    isEnabled: setting?.isEnabled ?? true,
    isDefault: setting?.isDefault ?? false,
    consentRequired: setting?.consentRequired ?? false,
    templateApprovalRequired: setting?.templateApprovalRequired ?? false,
    fallbackOrder: setting?.fallbackOrder ?? [CommunicationChannelType.InApp],
    dailyQuota: setting?.dailyQuota?.toString() ?? '',
    monthlyQuota: setting?.monthlyQuota?.toString() ?? '',
    secretReference: setting?.secretReference ?? '',
    status: setting?.status ?? CommunicationProviderStatus.Enabled,
  };
}

export function mapProviderFormToPayload(values: ProviderSettingFormValues) {
  return {
    channel: values.channel,
    providerName: values.providerName,
    senderId: values.senderId || null,
    isEnabled: values.isEnabled,
    isDefault: values.isDefault,
    consentRequired: values.consentRequired,
    templateApprovalRequired: values.templateApprovalRequired,
    fallbackOrder: values.fallbackOrder,
    dailyQuota: values.dailyQuota ? Number(values.dailyQuota) : null,
    monthlyQuota: values.monthlyQuota ? Number(values.monthlyQuota) : null,
    secretReference: values.secretReference || null,
    status: values.status,
  };
}

export function mapDeliveryAttemptToHistoryRow(attempt: DeliveryAttemptDto): INotification {
  const shortCampaignId = attempt.campaignId?.slice(0, 8) || '--';
  const dateTime = attempt.deliveredAt || attempt.sentAt || attempt.queuedAt || '';

  return {
    id: attempt.id,
    dateTime,
    title: `Campaign ${shortCampaignId}`,
    category: channelLabel(attempt.channel),
    sentBy: attempt.providerName || 'Communication',
    recipients: 1,
    channels: [channelLabel(attempt.channel)],
    status: attempt.status,
    totalRecipients: 1,
    delivered: attempt.deliveredAt ? 1 : 0,
    opened: attempt.readAt ? 1 : 0,
    failed: attempt.errorCode || attempt.errorMessage ? 1 : 0,
    subject: attempt.destination || channelLabel(attempt.channel),
    body: attempt.errorMessage || attempt.providerMessageId || 'Queued by Communication',
  };
}
