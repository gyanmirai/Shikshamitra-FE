import { it, expect, describe } from 'vitest';

import {
  configurationValues,
  configurationPayload,
  validateConfiguration,
} from './esi-configuration-form';

const settings = {
  hasSchoolWideScope: true,
  suggestedEffectiveMonth: '2026-11',
  history: [],
  current: {
    id: 'current',
    enabled: true,
    concurrencyStamp: 'original',
    effectiveMonth: '2026-10',
    registrationNumber: null,
    coveredSince: null,
    isCancelled: false,
  },
};
describe('Automatic ESIC settings', () => {
  it('uses statutory earnings and removes saved rate overrides from new edits', () => {
    const current = {
      ...settings.current,
      calculationSettings: {
        eligibilityBasis: 'GROSS' as const,
        calculationBasis: 'COMPONENT' as const,
        calculationComponentId: 'basic',
        employeePercentage: 0.5,
        employerPercentage: 2,
        overrideReason: 'Old override',
        evidenceReference: 'Old evidence',
      },
    };
    expect(configurationValues({ ...settings, current }).calculationSettings).toEqual({
      eligibilityBasis: 'CLASSIFIED_EARNINGS',
      calculationBasis: 'CLASSIFIED_EARNINGS',
    });
    expect(
      configurationPayload({
        ...configurationValues(settings),
        calculationSettings: current.calculationSettings,
      }).calculationSettings
    ).toEqual({ eligibilityBasis: 'CLASSIFIED_EARNINGS', calculationBasis: 'CLASSIFIED_EARNINGS' });
  });
  it('uses the selected scheduled version and concurrency stamp', () => {
    const scheduled = {
      ...settings.current,
      id: 'future',
      effectiveMonth: '2026-11',
      concurrencyStamp: 'future',
      registrationNumber: 'Scheduled',
    };
    expect(configurationValues({ ...settings, history: [scheduled] })).toMatchObject({
      effectiveMonth: '2026-11',
      concurrencyStamp: 'future',
      registrationNumber: 'Scheduled',
    });
  });
  it('validates month and registration without requiring optional registration', () => {
    expect(validateConfiguration(configurationValues(settings))).toEqual({});
    expect(
      validateConfiguration({ ...configurationValues(settings), effectiveMonth: '' })
    ).toHaveProperty('effectiveMonth');
    expect(
      validateConfiguration({
        ...configurationValues(settings),
        registrationNumber: 'x'.repeat(101),
      })
    ).toHaveProperty('registrationNumber');
  });
  it('trims registration and clears an empty date', () => {
    expect(
      configurationPayload({
        ...configurationValues(settings),
        registrationNumber: ' REG ',
        coveredSince: '',
      })
    ).toMatchObject({ registrationNumber: 'REG', coveredSince: null });
  });
});
