import { it, expect, describe } from 'vitest';

import {
  apiRuleToForm,
  getProrationFormChecks,
  toProrationPolicyPayload,
  buildProrationValidationSchema,
} from './useProrationPolicyForm';

import type {
  IProrationFeeHeadRule,
  IProrationPolicyFormValues,
} from '../types/finance-policy.types';

const values = (
  overrides: Partial<IProrationPolicyFormValues> = {}
): IProrationPolicyFormValues => ({
  policyType: 'proration',
  policyName: 'Mid-year admissions',
  policyCode: 'PRO-01',
  description: '',
  status: 'Draft',
  academicYearId: '7d4ca00b-0920-465c-82b3-0a1559c97a22',
  isDefault: false,
  feeHeadRules: [],
  ...overrides,
});

const dailyRule = (overrides: Partial<IProrationFeeHeadRule> = {}): IProrationFeeHeadRule => ({
  feeHeadId: 'tuition',
  feeType: 'Recurring',
  ruleType: 'DailyProration',
  applyOnAdmission: true,
  applyOnEarlyWithdrawal: false,
  configuration: { calculationBasis: 'CalendarDays', minimumChargeDays: 0, roundOff: 'NoRoundOff' },
  ...overrides,
});

describe('proration validation and checklist consistency', () => {
  it.each([-1, 367, 1.5, Number.NaN])(
    'rejects invalid minimum charge days: %s',
    async (minimumChargeDays) => {
      const form = values({
        feeHeadRules: [
          dailyRule({ configuration: { calculationBasis: 'CalendarDays', minimumChargeDays } }),
        ],
      });
      await expect(buildProrationValidationSchema(false).validate(form)).rejects.toMatchObject({
        path: 'feeHeadRules[0].configuration.minimumChargeDays',
      });
      expect(getProrationFormChecks(form).allRuleSettingsValid).toBe(false);
    }
  );

  it.each([0, 366, null])('accepts minimum charge days boundary: %s', async (minimumChargeDays) => {
    const form = values({
      feeHeadRules: [
        dailyRule({ configuration: { calculationBasis: 'CalendarDays', minimumChargeDays } }),
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeTruthy();
    expect(getProrationFormChecks(form).isReadyToPublish).toBe(true);
  });

  it.each([0, 32, 15.5, null])('rejects invalid monthly cutoff: %s', async (cutOffDay) => {
    const form = values({
      feeHeadRules: [
        dailyRule({
          ruleType: 'MonthlyProration',
          configuration: { monthlyRule: 'HalfMonthRule', cutOffDay },
        }),
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).rejects.toMatchObject({
      path: 'feeHeadRules[0].configuration.cutOffDay',
    });
    expect(getProrationFormChecks(form).isReadyToPublish).toBe(false);
  });

  it.each([1, 31])('accepts monthly cutoff boundary: %s', async (cutOffDay) => {
    const form = values({
      feeHeadRules: [
        dailyRule({
          ruleType: 'MonthlyProration',
          configuration: { monthlyRule: 'HalfMonthRule', cutOffDay },
        }),
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeTruthy();
  });

  it('reports errors in both independent events in a single validation', async () => {
    const form = values({
      feeHeadRules: [
        dailyRule({
          ruleType: 'MonthlyProration',
          configuration: { cutOffDay: 32 },
          applyOnEarlyWithdrawal: true,
          earlyWithdrawalRuleType: 'DailyProration',
          earlyWithdrawalConfiguration: { minimumChargeDays: -1 },
        }),
      ],
    });
    try {
      await buildProrationValidationSchema(false).validate(form, { abortEarly: false });
      expect.fail('Expected validation to reject both events');
    } catch (error: any) {
      expect(error.inner.map((entry: any) => entry.path)).toEqual(
        expect.arrayContaining([
          'feeHeadRules[0].configuration.monthlyRule',
          'feeHeadRules[0].configuration.cutOffDay',
          'feeHeadRules[0].earlyWithdrawalConfiguration.calculationBasis',
          'feeHeadRules[0].earlyWithdrawalConfiguration.minimumChargeDays',
        ])
      );
    }
  });

  it('ignores invalid disabled configurations, preserves them, and excludes inactive heads from the payload', async () => {
    const disabled = dailyRule({
      feeHeadId: 'inactive',
      applyOnAdmission: false,
      configuration: { minimumChargeDays: -1 },
      earlyWithdrawalRuleType: 'MonthlyProration',
      earlyWithdrawalConfiguration: { cutOffDay: 32 },
    });
    const form = values({ feeHeadRules: [dailyRule(), disabled] });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeTruthy();
    expect(getProrationFormChecks(form)).toMatchObject({
      allRuleSettingsValid: true,
      recurringEnabledCount: 1,
    });
    expect(toProrationPolicyPayload(form).feeHeadRules.map((rule) => rule.feeHeadId)).toEqual([
      'tuition',
    ]);
    expect(form.feeHeadRules[1]).toEqual(disabled);
  });

  it.each(['NoProration', 'FullMonthCharge'] as const)(
    'does not count %s toward the proration requirement',
    async (ruleType) => {
      const form = values({ feeHeadRules: [dailyRule({ ruleType })] });
      await expect(buildProrationValidationSchema(false).validate(form)).rejects.toThrow(
        'Enable Daily or Monthly proration'
      );
      expect(getProrationFormChecks(form)).toMatchObject({
        feeHeadsValid: false,
        recurringEnabledCount: 0,
        isReadyToPublish: false,
      });
    }
  );

  it('does not report an empty form as having validated event settings', () => {
    expect(getProrationFormChecks(values())).toMatchObject({
      allRuleSettingsValid: false,
      isReadyToPublish: false,
    });
  });

  it('rejects prorated one-time heads', async () => {
    const form = values({ feeHeadRules: [dailyRule({ feeType: 'OneTime' })] });
    await expect(
      buildProrationValidationSchema(false).validate(form, { abortEarly: false })
    ).rejects.toMatchObject({
      inner: expect.arrayContaining([
        expect.objectContaining({ message: 'One-time fee heads cannot be prorated' }),
      ]),
    });
    expect(getProrationFormChecks(form).allRuleSettingsValid).toBe(false);
  });

  it('ignores legacy rounding fields because the system rule is fixed', async () => {
    const form = values({
      feeHeadRules: [
        dailyRule({
          ruleType: 'MonthlyProration',
          configuration: {
            monthlyRule: 'HalfMonthRule',
            cutOffDay: 15,
            roundOff: 'invalid' as any,
          },
        }),
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeDefined();
    expect(toProrationPolicyPayload(form).feeHeadRules[0].roundingMode).toBe('RoundUpRupee');
  });

  it('uses trimmed general fields and change-reason limits in the checklist', () => {
    const form = values({ policyCode: ' PRO-01 ', feeHeadRules: [dailyRule()] });
    expect(getProrationFormChecks(form).generalValid).toBe(true);
    expect(
      getProrationFormChecks({ ...form, status: 'Active', changeReason: 'x'.repeat(501) }, true)
        .generalValid
    ).toBe(false);
    expect(getProrationFormChecks(form, false, true).isReadyToPublish).toBe(false);
  });
});

describe('proration policy API mapping', () => {
  it('sends only enabled rules and converts daily rule and rounding names', () => {
    const payload = toProrationPolicyPayload(
      values({
        feeHeadRules: [
          {
            feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
            feeType: 'Recurring',
            ruleType: 'DailyProration',
            configuration: {
              calculationBasis: 'CalendarDays',
              roundOff: 'RoundUp',
              minimumChargeDays: 5,
            },
          },
          {
            feeHeadId: 'a36b03e8-775b-4512-9732-195e97cdaed6',
            feeType: 'Recurring',
            ruleType: 'NoProration',
            configuration: {},
          },
        ],
      })
    );

    expect(payload.feeHeadRules).toEqual([
      expect.objectContaining({
        feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
        ruleType: 'Daily',
        roundingMode: 'RoundUpRupee',
        minimumChargeDays: 5,
      }),
    ]);
  });

  it('round-trips a monthly half-charge rule into the editor model', () => {
    const rule = apiRuleToForm({
      feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
      ruleType: 'MonthlyCutoff',
      roundingMode: 'NearestRupee',
      cutoffDay: 15,
      afterCutoffAction: 'HalfCharge',
    });

    expect(rule.ruleType).toBe('MonthlyProration');
    expect(rule.configuration).toEqual(
      expect.objectContaining({
        monthlyRule: 'HalfMonthRule',
        cutOffDay: 15,
        roundOff: 'RoundUp',
      })
    );
  });

  it('validates every monthly configuration field and active-policy change reason', async () => {
    const invalid = values({
      status: 'Active',
      feeHeadRules: [
        {
          feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
          feeType: 'Recurring',
          ruleType: 'MonthlyProration',
          configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: null },
        },
      ],
    });

    await expect(
      buildProrationValidationSchema(true).validateAt('changeReason', invalid)
    ).rejects.toThrow('Change reason is required for an Active policy');

    await expect(
      buildProrationValidationSchema(false).validate({ ...invalid, changeReason: 'Annual review' })
    ).rejects.toThrow('Monthly cut-off day must be a whole number from 1 to 31');
  });

  it('round-trips independent admission and withdrawal strategies without losing rounding', async () => {
    const apiRule = {
      feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
      ruleType: 'MonthlyCutoff' as const,
      roundingMode: 'NearestRupee' as const,
      cutoffDay: 15,
      afterCutoffAction: 'NoCharge' as const,
      applyOnAdmission: true,
      applyOnEarlyWithdrawal: true,
      earlyWithdrawalRuleType: 'MonthlyCutoff' as const,
      earlyWithdrawalCutoffDay: 10,
      earlyWithdrawalBeforeCutoffAction: 'HalfCharge' as const,
    };
    const form = values({ feeHeadRules: [apiRuleToForm(apiRule)] });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeTruthy();
    expect(toProrationPolicyPayload(form).feeHeadRules[0]).toEqual(
      expect.objectContaining({ ...apiRule, roundingMode: 'RoundUpRupee' })
    );
  });

  it('accepts withdrawal-only daily rules and saves an explicit independent model', async () => {
    const form = values({
      feeHeadRules: [
        {
          feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
          feeType: 'Recurring',
          ruleType: 'MonthlyProration',
          applyOnAdmission: false,
          configuration: { roundOff: 'RoundDown' },
          applyOnEarlyWithdrawal: true,
          earlyWithdrawalRuleType: 'DailyProration',
          earlyWithdrawalConfiguration: { calculationBasis: 'CalendarDays', minimumChargeDays: 3 },
        },
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).resolves.toBeTruthy();
    expect(toProrationPolicyPayload(form).feeHeadRules[0]).toEqual(
      expect.objectContaining({
        applyOnAdmission: false,
        applyOnEarlyWithdrawal: true,
        earlyWithdrawalRuleType: 'Daily',
        earlyWithdrawalMinimumChargeDays: 3,
        roundingMode: 'RoundUpRupee',
      })
    );
  });

  it('rejects invalid withdrawal cutoffs at the withdrawal field path', async () => {
    const form = values({
      feeHeadRules: [
        {
          feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
          feeType: 'Recurring',
          ruleType: 'NoProration',
          configuration: {},
          applyOnEarlyWithdrawal: true,
          earlyWithdrawalRuleType: 'MonthlyProration',
          earlyWithdrawalConfiguration: { monthlyRule: 'HalfMonthRule', cutOffDay: 32 },
        },
      ],
    });
    await expect(buildProrationValidationSchema(false).validate(form)).rejects.toMatchObject({
      path: 'feeHeadRules[0].earlyWithdrawalConfiguration.cutOffDay',
    });
  });

  it('preserves Full Month Charge separately from No Proration in the API', () => {
    const form = values({
      feeHeadRules: [
        {
          feeHeadId: 'd30b50a3-989b-4be7-b8a9-1cab0ea87704',
          feeType: 'Recurring',
          ruleType: 'FullMonthCharge',
          configuration: {},
        },
      ],
    });
    expect(toProrationPolicyPayload(form).feeHeadRules[0].ruleType).toBe('FullMonthCharge');
    expect(
      apiRuleToForm({ feeHeadId: 'head', ruleType: 'FullCharge', roundingMode: 'Currency' })
        .ruleType
    ).toBe('NoProration');
  });
});
