import { describe, expect, it } from 'vitest';

import {
  apiRuleToForm,
  toProrationPolicyPayload,
  buildProrationValidationSchema,
} from './useProrationPolicyForm';

import type { IProrationPolicyFormValues } from '../types/finance-policy.types';

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
        roundOff: 'NoRoundOff',
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
    ).rejects.toThrow('Monthly cut-off day is required');
  });
});
