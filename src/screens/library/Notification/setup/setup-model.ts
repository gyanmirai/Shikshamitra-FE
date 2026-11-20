import type { LibraryNotificationSettings } from 'src/redux/library/library-adapters';

export type NotificationSetup = NonNullable<LibraryNotificationSettings['setup']>;
export type SetupValues = {
  automaticReminderTimeLocal: string;
  studentInboxRouting: string;
  operationalRecipientUserIds: string[];
};
export const inboxRoutingChoices = [
  {
    value: 'Guardians',
    label: 'Guardians',
    detail: 'Only verified guardian accounts receive student inbox messages.',
  },
  {
    value: 'StudentAndGuardians',
    label: 'Student and guardians',
    detail: 'Verified student and guardian accounts receive student inbox messages.',
  },
  {
    value: 'Student',
    label: 'Student',
    detail: 'Only the verified student account receives student inbox messages.',
  },
];
export function setupChanges(original: SetupValues, values: SetupValues) {
  return {
    ...(original.automaticReminderTimeLocal !== values.automaticReminderTimeLocal
      ? { automaticReminderTimeLocal: values.automaticReminderTimeLocal }
      : {}),
    ...(original.studentInboxRouting !== values.studentInboxRouting
      ? { studentInboxRouting: values.studentInboxRouting }
      : {}),
    ...(JSON.stringify([...original.operationalRecipientUserIds].sort()) !==
    JSON.stringify([...values.operationalRecipientUserIds].sort())
      ? { operationalRecipientUserIds: values.operationalRecipientUserIds }
      : {}),
  };
}
