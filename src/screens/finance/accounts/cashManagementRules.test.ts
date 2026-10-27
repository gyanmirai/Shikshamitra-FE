import { it, expect, describe } from 'vitest';

import { cashCommandSchema, cashActionAllowed } from './cashManagementRules';

describe('cash management financial actions', () => {
  it('compares residual credit in cents and rejects a credit instant before dispatch', async () => {
    const values = { amount: '0.10', date: '2026-10-21T12:30:00+05:30', reference: 'statement' };
    expect(
      await cashCommandSchema('confirm', 0.3 - 0.2, '2026-10-20T12:30:00+05:30').isValid(values)
    ).toBe(true);
    expect(
      await cashCommandSchema('confirm', 100, '2026-10-21T12:30:00+05:30').isValid({
        ...values,
        date: '2026-10-21T12:29:00+05:30',
      })
    ).toBe(false);
  });
  it('requires a bank and a full matching count for approval', async () => {
    const schema = cashCommandSchema('approve', 10000);
    expect(await schema.isValid({ amount: '10000', bankAccountId: '' })).toBe(false);
    expect(await schema.isValid({ amount: '9999', bankAccountId: 'bank' })).toBe(false);
    expect(await schema.isValid({ amount: '10000.00', bankAccountId: 'bank' })).toBe(true);
  });
  it('finalizes the remaining count after expenses, including a fully spent receipt', async () => {
    const values = { amount: '8000', bankAccountId: 'bank' };
    expect(await cashCommandSchema('approve', 8000).isValid(values)).toBe(true);
    expect(await cashCommandSchema('approve', 8000).isValid({ ...values, amount: '10000' })).toBe(
      false
    );
    expect(await cashCommandSchema('approve', 0).isValid({ ...values, amount: '0' })).toBe(true);
    expect(await cashCommandSchema('approve', 0).isValid({ ...values, amount: '-1' })).toBe(false);
    await expect(
      cashCommandSchema('approve', 8000).validate({ ...values, amount: '10000' })
    ).rejects.toThrow('Count must match the remaining cash to deposit.');
  });
  it('supports partial deposits and credit but rejects excess, precision, future and pre-dispatch credit', async () => {
    const schema = cashCommandSchema('confirm', 6000, '2026-10-20T12:00:00+05:30');
    const values = { amount: '2000.25', date: '2026-10-21', reference: 'statement-123' };
    expect(await schema.isValid(values)).toBe(true);
    await Promise.all(
      [
        { amount: '6000.01' },
        { amount: '0' },
        { amount: '1.234' },
        { reference: '' },
        { date: '2099-01-01' },
        { date: '2026-10-19' },
      ].map(async (update) => {
        expect(await schema.isValid({ ...values, ...update })).toBe(false);
      })
    );
  });
  it('requires the exact action grant and server eligibility together', () => {
    expect(cashActionAllowed('Approve', ['Finance.Accounts.CashManagement.View'], true)).toBe(
      false
    );
    expect(cashActionAllowed('Approve', ['Finance.Accounts.CashManagement.Approve'], false)).toBe(
      false
    );
    expect(
      cashActionAllowed('Reconcile', ['Finance.Accounts.CashManagement.Reconcile'], true)
    ).toBe(true);
  });
});
