import { it, expect, describe } from 'vitest';

import { getPublicAdmissionStatusProblemMessage } from './public-status-utils';

describe('public admissions status OTP errors', () => {
  it('shows retry seconds for resend cooldown responses', () => {
    const result = getPublicAdmissionStatusProblemMessage(
      {
        error: {
          code: 'AdmissionCrm:StatusOtpResendTooSoon',
          data: { RetryAfterSeconds: 47 },
        },
      },
      'Unable to create OTP challenge.'
    );

    expect(result).toEqual({
      code: 'AdmissionCrm:StatusOtpResendTooSoon',
      message: 'Please wait 47 seconds before requesting another OTP.',
    });
  });

  it('localizes recovery guidance for Gujarati and Hindi', () => {
    const gujarati = getPublicAdmissionStatusProblemMessage(
      { code: 'AdmissionCrm:StatusOtpExpired' },
      'fallback',
      'gu'
    );
    const hindi = getPublicAdmissionStatusProblemMessage(
      { code: 'AdmissionCrm:StatusTokenExpired' },
      'fallback',
      'hi'
    );

    expect(gujarati.message).toContain('OTP');
    expect(gujarati.message).not.toContain('This OTP');
    expect(hindi.message).not.toContain('This status link');
  });

  it('extracts lockout codes from problem detail text', () => {
    const result = getPublicAdmissionStatusProblemMessage(
      {
        detail: 'One or more errors occurred. (AdmissionCrm:StatusOtpLocked)',
      },
      'Unable to verify OTP.'
    );

    expect(result).toEqual({
      code: 'AdmissionCrm:StatusOtpLocked',
      message: 'Too many incorrect OTP attempts. Request a new OTP to continue.',
    });
  });

  it('returns applicant-safe messages for invalid and expired OTP codes', () => {
    expect(
      getPublicAdmissionStatusProblemMessage(
        { error: { code: 'AdmissionCrm:InvalidStatusOtp' } },
        'Unable to verify OTP.'
      ).message
    ).toBe('The OTP code is incorrect. Check the latest code and try again.');

    expect(
      getPublicAdmissionStatusProblemMessage(
        { error: { code: 'AdmissionCrm:StatusOtpExpired' } },
        'Unable to verify OTP.'
      ).message
    ).toBe('This OTP has expired. Request a new OTP to continue.');
  });
});
