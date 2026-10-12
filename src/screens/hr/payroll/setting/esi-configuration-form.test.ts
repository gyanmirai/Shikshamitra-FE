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
      calculationSettings: { wageBasis: 'CLASSIFIED_EARNINGS' },
    });
  });
  it('requires a selected Basic component and documented rate overrides', () => {
    const draft = configurationValues(settings);
    expect(
      validateConfiguration({ ...draft, calculationSettings: { wageBasis: 'BASIC_COMPONENT' } })
    ).toHaveProperty('calculationSettings.basicComponentId');
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: { wageBasis: 'GROSS', employeePercentage: 0.5 },
      })
    ).toHaveProperty('calculationSettings.evidenceReference');
    expect(
      validateConfiguration({
        ...draft,
        calculationSettings: {
          wageBasis: 'GROSS',
          employerPercentage: 101,
          overrideReason: 'Reason',
          evidenceReference: 'Evidence',
        },
      })
    ).toHaveProperty('calculationSettings.employerPercentage');
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
