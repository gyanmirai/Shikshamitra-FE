import { it, expect } from 'vitest';

import {
  concessionValueLabel,
  policyDateLabel,
  policyDateTimeLabel,
} from './concessionPresentation';

it('keeps missing and invalid dates neutral', () => {
  expect(policyDateLabel(undefined)).toBe('—');
  expect(policyDateLabel('not-a-date')).toBe('—');
  expect(policyDateLabel('2026-10-05T09:00:00Z')).toBe('05 Oct 2026');
  expect(policyDateTimeLabel('not-a-date')).toBe('—');
  expect(policyDateTimeLabel(undefined)).toBe('—');
});

it('formats limits without showing null percentages or losing fractional rates', () => {
  expect(concessionValueLabel({ calculationMethod: 'Percentage', maximumPercentage: null })).toBe(
    '—'
  );
  expect(
    concessionValueLabel({
      calculationMethod: 'Percentage',
      valueSource: 'PolicyFixed',
      percentageValue: 12.5,
    })
  ).toBe('12.5%');
  expect(
    concessionValueLabel({ calculationMethod: 'FixedAmount', maximumFixedAmount: 40000 })
  ).toBe('₹40,000');
  expect(concessionValueLabel({ calculationMethod: 'FullWaiver' })).toBe('100%');
});
