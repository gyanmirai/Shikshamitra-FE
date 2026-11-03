import { it, expect, describe } from 'vitest';

import { financeSetupStages, financeSetupSettings } from './finance-setup-catalog';
import {
  safeFinanceReturnTo,
  getFinanceSettingLabel,
  getFinanceSetupPosition,
  getFinanceSetupStepStates,
} from './finance-setup-model';

describe('Finance setup navigation and truthful progress', () => {
  it('starts with Accounts Setup and income categories without an academic-year setup step', () => {
    expect(financeSetupStages[0]).toEqual({ key: 'accounts', title: 'Accounts Setup' });
    expect(getFinanceSetupPosition('invalid', null)).toEqual({
      stage: 'accounts',
      setting: 'income-categories',
    });
    expect(financeSetupSettings[0].key).toBe('income-categories');
  });
  it('falls back to an authorized setting instead of exposing a forbidden deep link', () => {
    expect(getFinanceSetupPosition('accounts', 'income-categories', ['bank-accounts'])).toEqual({
      stage: 'accounts',
      setting: 'bank-accounts',
    });
    expect(getFinanceSetupPosition('accounts', 'income-categories', [])).toEqual({
      stage: 'accounts',
      setting: null,
    });
    expect(getFinanceSetupPosition('assignment', 'fee-structures')).toEqual({
      stage: 'assignment',
      setting: null,
    });
  });
  it('does not mark operational guidance or an empty stage complete by navigating to review', () => {
    expect(getFinanceSetupStepStates([], [], null)).toEqual({});
    expect(getFinanceSetupStepStates([], [], '2026-11-02T00:00:00Z')).toEqual({
      review: 'complete',
    });
  });
  it('only completes a settings step when every visible setting has active configuration', () => {
    const settings = [
      {
        key: 'income-categories',
        canView: true,
        canManage: true,
        configurationState: 'configured' as const,
      },
      {
        key: 'expense-categories',
        canView: true,
        canManage: false,
        configurationState: 'empty' as const,
      },
      {
        key: 'bank-accounts',
        canView: false,
        canManage: false,
        configurationState: 'unavailable' as const,
      },
    ];
    expect(
      getFinanceSetupStepStates(settings, ['expense-categories'], null).accounts
    ).toBeUndefined();
    expect(
      getFinanceSetupStepStates(
        settings.map((item) => ({ ...item, configurationState: 'configured' as const })),
        [],
        null
      ).accounts
    ).toBe('complete');
  });
  it('does not let deferral disguise a failed or forbidden configuration check', () => {
    expect(getFinanceSettingLabel('unavailable', true)).toBe('Unable to check');
    expect(getFinanceSettingLabel('configured', true)).toBe('Active configuration available');
    expect(getFinanceSettingLabel('empty', true)).toBe('Deferred');
    expect(getFinanceSettingLabel('empty', false)).toBe('Needs setup');
  });
  it.each([
    'https://example.com',
    '//example.com',
    '/finance/setup',
    '/finance/setup?stage=review',
    '/finance/../security',
    '/finance/%2e%2e/security',
    '/finance/\\evil.com',
  ])('rejects unsafe or looping return target %s', (value) => {
    expect(safeFinanceReturnTo(value)).toBe('/finance/dashboard');
  });
  it('preserves a valid Finance return destination and its filters', () => {
    expect(safeFinanceReturnTo('/finance/income-tracking?search=fees#entries')).toBe(
      '/finance/income-tracking?search=fees#entries'
    );
  });
});
