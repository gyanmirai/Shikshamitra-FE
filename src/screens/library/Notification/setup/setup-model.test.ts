import { it, expect } from 'vitest';

import { setupChanges } from './setup-model';

it('omits unchanged configured account IDs from unrelated setup changes, including unavailable IDs', () => {
  const original = {
    automaticReminderTimeLocal: '08:30',
    studentInboxRouting: 'Guardians',
    operationalRecipientUserIds: ['saved-b', 'unavailable-a'],
  };
  expect(setupChanges(original, { ...original, automaticReminderTimeLocal: '09:15' })).toEqual({
    automaticReminderTimeLocal: '09:15',
  });
  expect(
    setupChanges(original, {
      ...original,
      operationalRecipientUserIds: [...original.operationalRecipientUserIds].reverse(),
    })
  ).toEqual({});
  expect(setupChanges(original, { ...original, operationalRecipientUserIds: ['saved-b'] })).toEqual(
    { operationalRecipientUserIds: ['saved-b'] }
  );
});
