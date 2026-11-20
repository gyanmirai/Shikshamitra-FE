import { it, expect } from 'vitest';

import { manualPolicy } from './manual-policy.fixture';
import { policySchema, policyPayload, policyInitialValues } from './policy-form';

it('hydrates and sends the exact saved Manual mode instead of allowing the server Automatic default', () => {
  const values = policyInitialValues(manualPolicy);
  expect(values).toHaveProperty('dueDateMode', 0);
  expect(policyPayload(values, manualPolicy).terms).toMatchObject({
    dueDateMode: 0,
    loanDays: 0,
    renewalDays: 0,
    pickupWindowDays: 0,
  });
});
it('accepts real manual terms with explicit-date operation and no automated durations', async () => {
  const values = { ...policyInitialValues(manualPolicy), dueDateMode: 0 };
  await expect(policySchema.validate(values)).resolves.toMatchObject({ dueDateMode: 0 });
});
it('keeps zero automated durations invalid when Automatic mode is selected', async () => {
  const values = { ...policyInitialValues(manualPolicy), dueDateMode: 1 };
  await expect(policySchema.validate(values)).rejects.toThrow();
});
it('keeps missing legacy mode compatible with Automatic rather than silently converting it to Manual', () => {
  const automatic = {
    ...manualPolicy,
    terms: {
      ...manualPolicy.terms,
      dueDateMode: undefined,
      loanDays: 14,
      renewalDays: 7,
      pickupWindowDays: 2,
    },
  };
  const values = policyInitialValues(automatic);
  expect(values).toHaveProperty('dueDateMode', 1);
  expect(policyPayload(values, automatic).terms.dueDateMode).toBe(1);
});
