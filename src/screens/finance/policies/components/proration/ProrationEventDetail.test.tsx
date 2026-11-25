import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ProrationEventDetail } from './ProrationEventDetail';

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

describe('saved proration event settings', () => {
  it.each([false, true])(
    'shows the full-month choice for an enabled event (withdrawal: %s)',
    (withdrawal) => {
      render(
        <ProrationEventDetail
          rule={rule({ applyOnAdmission: true, applyOnEarlyWithdrawal: true })}
          withdrawal={withdrawal}
        />
      );

      expect(screen.getByText('Monthly proration')).toBeVisible();
      expect(screen.getByText('Full month charge')).toBeVisible();
    }
  );

  it('hides a disabled event’s calculation settings', () => {
    render(<ProrationEventDetail rule={rule()} />);

    expect(screen.getByText('Disabled')).toBeVisible();
    expect(screen.queryByText('Full month charge')).not.toBeInTheDocument();
  });
});
