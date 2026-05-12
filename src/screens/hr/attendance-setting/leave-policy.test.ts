import { it, expect, describe } from 'vitest';
import { AccuralPolicyType } from 'src/enums/accuralPolicyType';

import { toAccrualPolicyTypeApiValue, normalizeAccrualPolicyTypeValue } from './leave-policy';

describe('leave policy accrual mapping', () => {
  it('normalizes API accrual policy values for the local select', () => {
    expect(normalizeAccrualPolicyTypeValue('Yearly')).toBe(AccuralPolicyType.Yearly);
    expect(normalizeAccrualPolicyTypeValue('Monthly')).toBe(AccuralPolicyType.Monthly);
  });

  it('sends the backend contract field value as text', () => {
    expect(toAccrualPolicyTypeApiValue(AccuralPolicyType.Yearly)).toBe('Yearly');
    expect(toAccrualPolicyTypeApiValue(AccuralPolicyType.Monthly)).toBe('Monthly');
  });
});
