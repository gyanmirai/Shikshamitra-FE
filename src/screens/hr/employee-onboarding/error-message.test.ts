import { it, expect, describe } from 'vitest';

import { getOnboardingErrorMessage } from './error-message';

describe('employee onboarding error messages', () => {
  it('surfaces backend duplicate-email messages from RTK query errors', () => {
    expect(
      getOnboardingErrorMessage(
        {
          data: {
            error: {
              message: 'An employee or open onboarding application already uses this email.',
            },
          },
        },
        'Could not create invite'
      )
    ).toBe('An employee or open onboarding application already uses this email.');
  });

  it('falls back when the backend error has no message', () => {
    expect(getOnboardingErrorMessage({}, 'Could not create invite')).toBe(
      'Could not create invite'
    );
  });
});
