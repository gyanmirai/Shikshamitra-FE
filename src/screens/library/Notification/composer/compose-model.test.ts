import { it, expect } from 'vitest';

import { composeSchema } from './compose-model';

const values = {
  eventType: 'dueDateReminder',
  channel: 'Email',
  subject: 'Return reminder',
  message: 'Dear {{memberName}}, please visit the library.',
  recipients: [
    {
      id: 'student-id',
      memberName: 'Asha',
      role: 0,
      isActiveMembership: true,
      hasRecoverableObligation: false,
      isEligibleForNotification: true,
    },
  ],
};
it('rejects record variables that the manual send cannot render, including dotted tokens', async () => {
  await expect(
    composeSchema.validate({ ...values, message: 'Return {{book.title}}.' })
  ).rejects.toThrow(/double-brace variables/);
});
it('requires a real selected recipient rather than a display name or empty audience', async () => {
  await expect(composeSchema.validate({ ...values, recipients: [] })).rejects.toThrow(
    /Select at least one member/
  );
});
it('accepts the actual base variables and an eligible recovery candidate without a borrowing-quota check', async () => {
  await expect(
    composeSchema.validate({
      ...values,
      recipients: [
        { ...values.recipients[0], isActiveMembership: false, hasRecoverableObligation: true },
      ],
    })
  ).resolves.toBeDefined();
});
