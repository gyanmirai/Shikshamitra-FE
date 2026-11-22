import type { AcademicNotificationEvent, AcademicNotificationChannel } from 'src/redux/academic-notifications/types';

import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

export type TemplateVariable = AcademicNotificationEvent['definition']['variables'][number];
export type TemplateTextField = 'subject' | 'body';

const limits: Record<AcademicNotificationChannel, Record<TemplateTextField, number>> = {
  [CommunicationChannelType.WhatsApp]: { subject: 60, body: 1024 },
  [CommunicationChannelType.Email]: { subject: 256, body: 65536 },
  [CommunicationChannelType.InApp]: { subject: 256, body: 4000 },
  [CommunicationChannelType.WebPush]: { subject: 80, body: 240 },
};

export function templateRecipientKinds(selectors: readonly string[]) {
  return Array.from(new Set(selectors.map((kind) =>
    kind === 'PrimaryGuardian' || kind === 'AdditionalGuardians' ? 'Guardian' : kind
  )));
}

export function templateVariableToken(key: string) {
  return `{{${key}}}`;
}

export function insertTemplateVariable(value: string, start: number, end: number, key: string) {
  const token = templateVariableToken(key);
  return { value: value.slice(0, start) + token + value.slice(end), caret: start + token.length };
}

export function templateMessageError(
  value: string,
  field: TemplateTextField,
  channel: AcademicNotificationChannel,
  variables: readonly TemplateVariable[]
) {
  if (field === 'body' && !value.trim()) return 'Enter a message.';
  if (field === 'subject' && Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  })) return 'Use one line for the subject.';
  const limit = limits[channel][field];
  if (value.length > limit) return `Use ${limit} characters or fewer.`;
  const tokens = /\{\{([a-z][a-z0-9_]*)\}\}/g;
  const unknown = Array.from(value.matchAll(tokens)).find((match) =>
    !variables.some((variable) => variable.key === match[1])
  );
  if (unknown) return `Variable ${unknown[0]} is unavailable for this event.`;
  const literal = value.replace(tokens, '');
  if (literal.includes('{{') || literal.includes('}}')) return 'Choose a variable from the list to insert its token.';
  return undefined;
}
