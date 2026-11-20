import { CommunicationChannelType } from '../communication/communicationTypes';

import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicNotificationEvent,
  AcademicNotificationCatalogue,
  AcademicNotificationRuleListItem,
} from './types';

export const notificationChannelLabels = {
  [CommunicationChannelType.InApp]: 'In-app',
  [CommunicationChannelType.Email]: 'Email',
  [CommunicationChannelType.WebPush]: 'Browser push',
  [CommunicationChannelType.WhatsApp]: 'WhatsApp',
};

export function notificationLabel(value: string) {
  return value.replace(/([a-z\d])([A-Z])/g, '$1 $2');
}

export function notificationEventLabel(event: AcademicNotificationEvent) {
  return notificationEventKeyLabel(event.definition.eventKey);
}

export function notificationEventKeyLabel(eventKey: string) {
  if (eventKey === weeklySummaryEvent) return 'Weekly academic summary';
  const words = eventKey.split('.').slice(1).map(notificationLabel).join(' ');
  return words.charAt(0) + words.slice(1).toLowerCase();
}

export function notificationRuleRows(
  catalogue: AcademicNotificationCatalogue,
  page: PagedResultDto<AcademicNotificationRuleListItem>
) {
  const events = new Map(catalogue.events.map((event) => [event.definition.eventKey, event]));
  const channels = new Map(catalogue.channels.map((channel) => [channel.channel, channel.isConfigured]));
  return page.items.flatMap((item) => {
    const event = events.get(item.eventKey);
    if (!event) return [];
    const { effectiveRule, isInherited } = item;
    const configuration = effectiveRule?.configuration;
    const state = effectiveRule ? (effectiveRule.enabled ? 'enabled' : 'disabled') : 'unconfigured';
    const status = { enabled: 'Enabled', disabled: 'Disabled', unconfigured: 'Unconfigured' }[state];
    const deliveryChannels = (configuration?.channels ?? []).map((channel) => ({
      id: channel,
      label: notificationChannelLabels[channel],
      configured: channels.get(channel) === true,
    }));
    return [{
      id: item.eventKey,
      name: notificationEventLabel(event),
      event,
      item,
      state,
      status: isInherited ? `${status} · inherited` : status,
      trigger: notificationTriggerLabel(event),
      deliveryChannels,
    }];
  });
}

export type AcademicNotificationRuleRow = ReturnType<typeof notificationRuleRows>[number];

export const weeklySummaryEvent = 'Academic.Summary.Weekly';

function notificationTriggerLabel(event: AcademicNotificationEvent) {
  const { eventKey, triggerType } = event.definition;
  if (triggerType === 1) {
    if (eventKey === weeklySummaryEvent) return 'Weekly summary';
    if (isDailyDigest(eventKey)) return 'Daily digest';
  }
  return { 0: 'On change', 1: 'Scheduled reminder', 2: 'Manual' }[triggerType];
}

export const progressMilestoneEvent = 'Academic.Progress.MilestoneReached';

export function isDailyDigest(eventKey: string) {
  return eventKey === 'Academic.Homework.Submitted' ||
    eventKey === 'Academic.Assignment.Submitted' ||
    eventKey === 'Academic.Progress.BehindSchedule' ||
    eventKey === progressMilestoneEvent;
}
