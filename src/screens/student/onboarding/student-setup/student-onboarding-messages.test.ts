import { it, expect, describe } from 'vitest';

import { getOnboardingMessage, getOnboardingErrorMessage } from './student-onboarding-messages';

const fallback = 'Changes could not be saved. Try again.';
const portalFailure = (reason: string) => ({
  status: 400,
  data: {
    errorCode: 'Students.Onboarding.PortalAccountInvalid',
    detail: 'One or more business rules were violated.',
    data: { Reason: reason },
  },
});

describe('onboarding staff messages', () => {
  it('explains an existing email without allowing a second account or assuming it is a parent', () => {
    expect(
      getOnboardingErrorMessage(
        portalFailure(
          'An identity already uses this email. Only an explicitly confirmed, verified existing guardian portal account may be linked for a sibling.'
        ),
        fallback
      )
    ).toBe(
      'This email already has an app login. Use a different student email, or ask your administrator to check the existing login.'
    );
  });

  it('keeps different portal rejections distinct instead of mapping all to duplicate email', () => {
    expect(
      getOnboardingErrorMessage(
        portalFailure('The saved email changed. Refresh the recipient before sending credentials.'),
        fallback
      )
    ).toBe('The email has changed. Refresh App Login and check the email before sending.');
    expect(
      getOnboardingErrorMessage(
        portalFailure(
          'Student app access is not enabled for this case. Review its saved portal-access requirements.'
        ),
        fallback
      )
    ).toBe(
      'Student login is turned off for this student. Ask your administrator to review App Login settings.'
    );
  });

  it('also reads nested ABP reasons', () => {
    expect(
      getOnboardingErrorMessage(
        {
          data: {
            error: {
              code: 'Students.Onboarding.PortalAccountInvalid',
              data: { Reason: 'Wait two minutes before sending credentials again.' },
            },
          },
        },
        fallback
      )
    ).toBe('Wait two minutes before sending login details again.');
  });

  it('uses a staff-readable duplicate message for dotted and colon error codes', () => {
    ['Students.Onboarding.RollNumberDuplicate', 'Students:Onboarding:RollNumberDuplicate'].forEach(
      (code) => {
        expect(getOnboardingErrorMessage({ data: { errorCode: code } }, fallback)).toBe(
          'This roll number is already in use or reserved. Enter a different number.'
        );
      }
    );
  });

  it('preserves useful field guidance and known local errors', () => {
    expect(
      getOnboardingErrorMessage(new Error('Choose a division with available capacity.'), fallback)
    ).toBe('Choose a division with available capacity.');
    expect(getOnboardingMessage('Verify the required transfer certificate.', fallback)).toBe(
      'Verify the required transfer certificate.'
    );
    expect(getOnboardingMessage('GR number is locked.', fallback)).toBe(
      'This number is locked. Ask an administrator to unlock it before editing.'
    );
  });

  it('does not expose raw exceptions, identifiers, generic failure or transport error text', () => {
    [
      'System.InvalidOperationException: failure',
      'Npgsql connection timeout',
      'TimeoutException: The operation has timed out.',
      'AbpIdentity.Users.Update is required.',
      'One or more business rules were violated.',
      'An identity policy failed unexpectedly.',
      'Student 3a245dab-2a67-fdd3-84cc-2809f79efd73 failed.',
      'Failed to fetch',
      '{"error":"secret"}',
    ].forEach((detail) => {
      expect(getOnboardingErrorMessage({ data: { detail } }, fallback)).toBe(fallback);
    });
    expect(getOnboardingMessage(undefined, fallback)).toBe(fallback);
  });

  it('explains stale data and restricted access without changing their checks', () => {
    expect(
      getOnboardingErrorMessage(
        { data: { errorCode: 'Students.Onboarding.ConcurrencyConflict' } },
        fallback
      )
    ).toBe('Student details have changed. Refresh and review them before saving again.');
    expect(getOnboardingErrorMessage({ status: 403 }, fallback)).toBe(
      'You cannot make this change. Ask your administrator for access.'
    );
  });

  it('keeps queue/completion and existing-parent states distinct', () => {
    expect(
      getOnboardingMessage('Credentials are queued for onboarding completion.', fallback)
    ).toBe('Login email is queued until onboarding is complete.');
    expect(
      getOnboardingMessage(
        'Uses the existing parent login. No new credentials are needed.',
        fallback
      )
    ).toBe(
      "This student uses the parent's existing login. No new password or login email is needed."
    );
  });

  it('leaves Finance errors to the existing shared parser', () => {
    expect(
      getOnboardingErrorMessage(
        { data: { errorCode: 'Finance:AccountsRegisterInvalidPeriod' } },
        fallback
      )
    ).toBe('Select a month or payment date within the academic year.');
  });
});
