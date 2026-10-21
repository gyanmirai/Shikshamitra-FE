import { it, expect, describe } from 'vitest';

import { hasActiveProration } from './ProrationEventDetail';

import type { IProrationPolicyRule } from '../../types/finance-policy.types';

const rule = (overrides: Partial<IProrationPolicyRule> = {}): IProrationPolicyRule => ({
  feeHeadId: 'tuition',
  ruleType: 'FullMonthCharge',
  roundingMode: 'RoundUpRupee',
  applyOnAdmission: false,
  applyOnEarlyWithdrawal: false,
  earlyWithdrawalRuleType: 'FullMonthCharge',
  ...overrides,
});

describe('saved-policy proration counts', () => {
  it('counts full-month proration for either enabled event', () => {
    expect(hasActiveProration(rule({ applyOnAdmission: true }))).toBe(true);
    expect(hasActiveProration(rule({ applyOnEarlyWithdrawal: true }))).toBe(true);
  });

  it('excludes disabled and no-proration events', () => {
    expect(hasActiveProration(rule())).toBe(false);
    expect(
      hasActiveProration(
        rule({
          applyOnAdmission: true,
          applyOnEarlyWithdrawal: true,
          ruleType: 'FullCharge',
          earlyWithdrawalRuleType: 'FullCharge',
        })
      )
    ).toBe(false);
  });
});
