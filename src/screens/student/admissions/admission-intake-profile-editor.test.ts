import { it, expect, describe } from 'vitest';

import { getProfileStepSchema, getInitialProfileValues } from './admission-intake-profile-editor';

describe('admission intake profile steps', () => {
  it('requires a type and profile identity before a new profile can reach its rules', async () => {
    const values = getInitialProfileValues(null);

    await expect(getProfileStepSchema(0, false, null).validate(values)).rejects.toThrow(
      'Choose a profile type'
    );
    values.code = 'INQUIRY';
    await expect(getProfileStepSchema(1, false, 0).validate(values)).rejects.toThrow(
      'Enter a profile name'
    );
  });

  it('rejects an inquiry follow-up period outside the server range', async () => {
    const values = getInitialProfileValues(null);
    values.kind = 0;
    values.inquiry.followUpDueInDays = 91;

    await expect(getProfileStepSchema(2, false, 0).validate(values)).rejects.toThrow(
      'Use at most 90 days'
    );
  });

  it('requires a counsellor pool and applies the edit-step offset', async () => {
    const values = getInitialProfileValues(null);
    values.kind = 1;

    await expect(getProfileStepSchema(1, true, 1).validate(values)).rejects.toThrow(
      'Choose at least one counsellor'
    );
  });
});
