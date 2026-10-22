import { it, expect } from 'vitest';

import { normalizePolicyName, isDuplicatePolicyNameError } from './policy-name';

it('normalizes repeated internal whitespace, including unicode spaces, before submission', () => {
  expect(normalizePolicyName('  30_  Sibling\tTuition\u00a0 Assistance  ')).toBe(
    '30_ Sibling Tuition Assistance'
  );
});

it('recognizes every policy name conflict without treating other rules as duplicates', () => {
  for (const family of ['ConcessionPolicy', 'RefundPolicy', 'ProrationPolicy']) {
    expect(isDuplicatePolicyNameError(`Finance:${family}:010005`)).toBe(true);
  }
  expect(isDuplicatePolicyNameError('Finance:CollectionPolicy:010034')).toBe(true);
  expect(isDuplicatePolicyNameError('Finance:ProrationPolicy:010025')).toBe(false);
});
