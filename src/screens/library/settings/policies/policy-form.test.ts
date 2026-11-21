import { it, expect, describe } from 'vitest';

import { policySchema } from './policy-form';

const valid = {
  name: 'Middle school lending',
  role: 0,
  effectiveFrom: '2026-11-16',
  effectiveTo: '',
  bookCategoryId: '',
  sectionId: '',
  educationMediumStageId: '',
  standardId: '',
  priority: '0',
  maxBooksAtTime: '0',
  reservationLimit: '0',
  loanDays: '14',
  dueDateMode: 1,
  dayCountingMode: 1,
  maxRenewals: '1',
  renewalDays: '7',
  pickupWindowDays: '2',
  moveDueDateToNextOpenDay: true,
};

describe('borrowing policy draft validation', () => {
  it('requires explicit limits but preserves deliberate zero and accepts draft without timezone', async () => {
    await expect(policySchema.validate(valid)).resolves.toBeDefined();
    await expect(policySchema.validate({ ...valid, maxBooksAtTime: '' })).rejects.toThrow(
      'required'
    );
  });
  it('rejects reversed effective dates and renewal allowance without a renewal duration', async () => {
    await expect(policySchema.validate({ ...valid, effectiveTo: '2026-11-01' })).rejects.toThrow(
      'Effective'
    );
    await expect(policySchema.validate({ ...valid, renewalDays: '0' })).rejects.toThrow('Renewal');
  });
  it('prevents a staff draft from carrying stale student stage or class scope', async () => {
    await expect(
      policySchema.validate({ ...valid, role: 1, standardId: 'class-id' })
    ).rejects.toThrow('Staff');
  });
});
