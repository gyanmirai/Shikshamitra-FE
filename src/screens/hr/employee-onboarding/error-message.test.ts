import { it, expect, describe } from 'vitest';

import { getOnboardingErrorMessage } from './error-message';

describe('staff onboarding error messages', () => {
  it('surfaces backend duplicate-email messages from RTK query errors', () => {
    expect(
      getOnboardingErrorMessage(
        {
          data: {
            error: {
              message: 'A staff member or open onboarding application already uses this email.',
            },
          },
        },
        'Could not create invite'
      )
    ).toBe('A staff member or open onboarding application already uses this email.');
  });

  it('surfaces RFC 7807 problem details returned by the API middleware', () => {
    expect(
      getOnboardingErrorMessage(
        {
          data: {
            type: 'https://httpstatuses.com/400',
            title: 'Bad request',
            status: 400,
            detail: 'A staff member or open onboarding application already uses this email.',
            errorCode: 'HR:Employee:010409',
          },
        },
        'Could not create invite'
      )
    ).toBe('A staff member or open onboarding application already uses this email.');
  });

  it('falls back when the backend error has no message', () => {
    expect(getOnboardingErrorMessage({}, 'Could not create invite')).toBe(
      'Could not create invite'
    );
  });
});
