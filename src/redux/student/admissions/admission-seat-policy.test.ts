import { it, expect, describe } from 'vitest';

import { DEFAULT_SEAT_POLICY, readAdmissionSeatPolicy, writeAdmissionSeatPolicy,
  getAdmissionSeatConfigurationError } from './admission-seat-policy';

describe('managed Seat stage policy', () => {
  it('keeps an existing basic Seat stage compatible', () => {
    expect(readAdmissionSeatPolicy(undefined)).toBeNull();
    expect(getAdmissionSeatConfigurationError(undefined)).toBeUndefined();
  });

  it('preserves unrelated stage configuration', () => {
    const json = writeAdmissionSeatPolicy(JSON.stringify({ custom: { kept: true } }), DEFAULT_SEAT_POLICY);
    expect(JSON.parse(json)).toMatchObject({ custom: { kept: true }, seat: DEFAULT_SEAT_POLICY });
  });

  it('supports automatic reservation, waitlisting, renewals, and explicit outcomes', () => {
    const policy = { ...DEFAULT_SEAT_POLICY, reservationMode: 'onEntry' as const,
      allowDurationOverride: true, minimumDurationHours: 24, maximumDurationHours: 720,
      allowedCompletionOutcomes: ['confirmed', 'waitlisted', 'expired'] as const };
    const json = JSON.stringify({ seat: policy });
    expect(readAdmissionSeatPolicy(json)).toEqual(policy);
    expect(getAdmissionSeatConfigurationError(json)).toBeUndefined();
  });

  it('requires confirmed and prevents waitlist completion when waitlisting is disabled', () => {
    const missingConfirmed = JSON.stringify({ seat: { ...DEFAULT_SEAT_POLICY,
      allowedCompletionOutcomes: ['released'] } });
    expect(getAdmissionSeatConfigurationError(missingConfirmed)).toContain('include Confirmed');
    const disabledWaitlist = JSON.stringify({ seat: { ...DEFAULT_SEAT_POLICY, allowWaitlist: false,
      allowedCompletionOutcomes: ['confirmed', 'waitlisted'] } });
    expect(getAdmissionSeatConfigurationError(disabledWaitlist)).toContain('Enable the waitlist');
  });
});
