import { it, expect, describe } from 'vitest';

import { configurationValues, validateConfiguration } from './esi-configuration-form';

describe('ESIC calculation configuration', () => {
  const settings = {
    hasSchoolWideScope: true,
    suggestedEffectiveMonth: '2026-11',
    history: [],
    current: {
      id: 'existing',
      enabled: true,
      concurrencyStamp: 'original',
      effectiveMonth: '2026-10',
      registrationNumber: null,
      coveredSince: null,
      isCancelled: false,
    },
  };
  it('preserves classified earnings for existing configurations', () => {
    expect(configurationValues(settings)).toMatchObject({
      effectiveMonth: '2026-11',
      calculationSettings: {
        eligibilityBasis: 'CLASSIFIED_EARNINGS',
        calculationBasis: 'CLASSIFIED_EARNINGS',
      },
    });
  });
  it('requires a selected Basic component and documented rate overrides', () => {
    const draft = configurationValues(settings);
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: { ...draft.calculationSettings, eligibilityBasis: 'BASIC_COMPONENT' },
      })
    ).toHaveProperty('calculationSettings.basicComponentId');
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: {
          ...draft.calculationSettings,
          calculationBasis: 'GROSS',
          employeePercentage: 0.5,
        },
      })
    ).toHaveProperty('calculationSettings.evidenceReference');
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: {
          ...draft.calculationSettings,
          calculationBasis: 'GROSS',
          employerPercentage: 101,
          overrideReason: 'Reason',
          evidenceReference: 'Evidence',
        },
      })
    ).toHaveProperty('calculationSettings.employerPercentage');
  });
  it('requires Basic when only the calculation basis uses it', () => {
    const draft = configurationValues(settings);
    const calculationSettings = {
      ...draft.calculationSettings,
      eligibilityBasis: 'GROSS' as const,
      calculationBasis: 'BASIC_COMPONENT' as const,
    };
    expect(validateConfiguration({ ...draft, calculationSettings })).toHaveProperty(
      'calculationSettings.basicComponentId'
    );
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: { ...calculationSettings, basicComponentId: 'school-basic' },
      })
    ).toEqual({});
  });
  it('preserves independently saved and scheduled bases', () => {
    const calculationSettings = {
      eligibilityBasis: 'GROSS' as const,
      calculationBasis: 'BASIC_COMPONENT' as const,
      basicComponentId: 'school-basic',
    };
    const current = { ...settings.current, calculationSettings };
    expect(configurationValues({ ...settings, current }).calculationSettings).toEqual(
      calculationSettings
    );
    const scheduled = {
      ...current,
      effectiveMonth: '2026-11',
      concurrencyStamp: 'future',
      calculationSettings: {
        ...calculationSettings,
        eligibilityBasis: 'BASIC_COMPONENT' as const,
        calculationBasis: 'GROSS' as const,
      },
    };
    expect(
      configurationValues({ ...settings, current, history: [scheduled] }).calculationSettings
    ).toEqual(scheduled.calculationSettings);
  });
  it('uses the scheduled version concurrency token without replacing it with the current token', () => {
    const scheduled = {
      ...settings.current,
      id: 'scheduled',
      effectiveMonth: '2026-11',
      concurrencyStamp: 'future',
    };
    expect(configurationValues({ ...settings, history: [scheduled] }).concurrencyStamp).toBe(
      'future'
    );
  });
});
