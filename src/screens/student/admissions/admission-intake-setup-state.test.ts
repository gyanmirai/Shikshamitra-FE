import { it, expect, describe } from 'vitest';

import {
  getAdmissionIntakeSetupListState,
  getLegacyAdmissionIntakeProfilesState,
  isAdmissionIntakeSetupConcurrencyError,
} from './admission-intake-setup-state';

describe('admission intake setup screen state', () => {
  it.each([
    [{ isLoading: true, isError: false, hasData: false, rowCount: 0 }, 'loading'],
    [{ isLoading: false, isError: true, hasData: false, rowCount: 0 }, 'error'],
    [{ isLoading: false, isError: false, hasData: true, rowCount: 0 }, 'empty'],
    [{ isLoading: false, isError: false, hasData: true, rowCount: 2 }, 'ready'],
  ] as const)('returns the mutually exclusive %s state', (input, expected) => {
    expect(getAdmissionIntakeSetupListState(input)).toBe(expected);
  });

  it('recognises the setup concurrency error in colon and dot formats', () => {
    expect(
      isAdmissionIntakeSetupConcurrencyError({
        data: { error: { code: 'Admissions:Intake:ConcurrencyConflict' } },
      })
    ).toBe(true);
    expect(
      isAdmissionIntakeSetupConcurrencyError({
        data: { error: { code: 'Admissions.Intake.ConcurrencyConflict' } },
      })
    ).toBe(true);
    expect(
      isAdmissionIntakeSetupConcurrencyError({
        data: { error: { code: 'Admissions:Intake:SetupInUse' } },
      })
    ).toBe(false);
  });

  it.each([
    [{ isLoading: true, isError: false, profileCount: 0 }, 'loading'],
    [{ isLoading: false, isError: true, profileCount: 0 }, 'error'],
    [{ isLoading: false, isError: false, profileCount: 0 }, 'empty'],
    [{ isLoading: false, isError: false, profileCount: 1 }, 'ready'],
  ] as const)('returns the recoverable Legacy profiles %s state', (input, expected) => {
    expect(getLegacyAdmissionIntakeProfilesState(input)).toBe(expected);
  });
});
