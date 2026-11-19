import type {
  AcademicNotificationRule,
  AcademicNotificationEvent,
  AcademicNotificationChannel,
  SaveAcademicNotificationRule,
  PublishedNotificationTemplateOption,
} from 'src/redux/academic-notifications/types';

import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

const familySelectors = ['PrimaryGuardian', 'AdditionalGuardians', 'StudentAccount'];

export function staffRuleSelectors(event: AcademicNotificationEvent) {
  return event.definition.recipientSelectors.filter((selector) => !familySelectors.includes(selector));
}

export function ruleFormValues(rule: AcademicNotificationRule | null) {
  const config = rule?.configuration;
  return {
    enabled: rule?.enabled ?? false,
    additionalGuardianRelationships: config?.additionalGuardianRelationships ?? [],
    includeStudentAccount: config?.includeStudentAccount ?? false,
    staffAudienceSelectors: config?.staffAudienceSelectors ?? [],
    channels: config?.channels ?? [CommunicationChannelType.InApp] as AcademicNotificationChannel[],
    templateIds: config?.templateIds ?? [],
    fallbackLanguage: config?.fallbackLanguage ?? 'en',
    delayMinutes: config?.timing.delayMinutes ?? 0,
    reminderSchoolDaysBefore: config?.timing.reminderSchoolDaysBefore ?? 1,
    reminderLocalTime: config?.timing.reminderLocalTime ?? '17:00:00',
    quietHoursEnabled: config?.timing.quietHoursEnabled ?? true,
    quietStart: config?.timing.quietStart ?? '20:00:00',
    quietEnd: config?.timing.quietEnd ?? '07:00:00',
    bypassQuietHours: config?.timing.bypassQuietHours ?? false,
  };
}

export type RuleFormValues = ReturnType<typeof ruleFormValues>;

export function ruleCommand(values: RuleFormValues, row: { eventKey: string; scope: SaveAcademicNotificationRule['scope']; concurrencyStamp?: string }): SaveAcademicNotificationRule {
  return {
    ...row,
    enabled: values.enabled,
    guardianMode: values.additionalGuardianRelationships.length ? 1 : 0,
    additionalGuardianRelationships: values.additionalGuardianRelationships,
    includeStudentAccount: values.includeStudentAccount,
    staffAudienceSelectors: values.staffAudienceSelectors,
    channels: values.channels,
    templateIds: values.templateIds,
    fallbackLanguage: values.fallbackLanguage.trim().toLowerCase(),
    timing: {
      delayMinutes: values.delayMinutes,
      reminderSchoolDaysBefore: values.reminderSchoolDaysBefore,
      reminderLocalTime: values.reminderLocalTime,
    },
    quietHours: {
      enabled: values.quietHoursEnabled,
      start: values.quietStart,
      end: values.quietEnd,
      bypass: values.bypassQuietHours,
    },
  };
}

export function ruleRecipientKinds(values: RuleFormValues, event: AcademicNotificationEvent) {
  const kinds = [...values.staffAudienceSelectors];
  if (event.definition.recipientSelectors.includes('PrimaryGuardian') || values.additionalGuardianRelationships.length) kinds.push('Guardian');
  if (values.includeStudentAccount) kinds.push('StudentAccount');
  return kinds;
}

export function templateCoverageError(values: RuleFormValues, kinds: string[], options: PublishedNotificationTemplateOption[]) {
  const selected = options.filter((template) => values.templateIds.includes(template.templateId));
  if (selected.length !== values.templateIds.length ||
    selected.some((template) => !kinds.includes(template.recipientKind) || !values.channels.includes(template.channel))) {
    return 'Choose published templates that match the selected recipients and channels.';
  }
  if (!values.enabled) return undefined;
  const unique = new Set(selected.map(({ recipientKind, channel, languageCode }) => `${recipientKind}:${channel}:${languageCode}`));
  if (unique.size !== selected.length) return 'Select one template per recipient, channel, and language.';
  const fallback = values.fallbackLanguage.trim().toLowerCase();
  if (kinds.some((kind) => values.channels.some((channel) => !unique.has(`${kind}:${channel}:${fallback}`)))) {
    return 'Select a published template in the fallback language for every recipient and channel.';
  }
  return undefined;
}
