import { it, expect } from 'vitest';

import {
  mapLibraryNotificationHistoryDto,
  mapLibraryNotificationSettingsDto,
} from './library-adapters';

it('preserves server setup authority and real reminder cadence', () => {
  const setup = {
    timeZoneId: 'Asia/Kolkata',
    automaticReminderTimeLocal: '08:30',
    studentInboxRouting: 'Guardians',
    operationalRecipientUserIds: ['operator-id'],
    needsConfiguration: false,
    configurationIssues: [],
  };
  const result = mapLibraryNotificationSettingsDto({
    canManageSettings: false,
    setup,
    items: [{ id: 'setting-id', repeatIntervalDays: 7 }],
  });
  expect(result).toMatchObject({ canManageSettings: false, setup });
  expect(result.items[0]).toHaveProperty('repeatIntervalDays', 7);
});

it('retains queued delivery attempts and recipient-bound inbox evidence', () => {
  const evidence = {
    id: 'history-id',
    status: 'Queued',
    attemptCount: 2,
    nextAttemptAt: '2026-11-18T03:00:00Z',
    recipientKind: 'VerifiedGuardian',
    recipientRelationship: 'mother',
    recipientUserId: 'guardian-id',
    readAt: '2026-11-17T10:00:00Z',
  };
  expect(mapLibraryNotificationHistoryDto(evidence)).toMatchObject(evidence);
});

it('preserves actual configured operator labels and unavailable saved IDs without inventing names', () => {
  const configuredOperationalRecipients = [
    {
      userId: 'gone-id',
      userName: null,
      displayName: null,
      isEligible: false,
      unavailableReason: 'Account unavailable in this school.',
    },
    {
      userId: 'operator-id',
      userName: 'librarian-a',
      displayName: 'School Librarian',
      isEligible: true,
      unavailableReason: null,
    },
  ];
  expect(
    mapLibraryNotificationSettingsDto({
      setup: {
        operationalRecipientUserIds: ['gone-id', 'operator-id'],
        configuredOperationalRecipients,
      },
    })
  ).toMatchObject({
    setup: {
      operationalRecipientUserIds: ['gone-id', 'operator-id'],
      configuredOperationalRecipients,
    },
  });
});
