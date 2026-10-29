import { it, expect, describe } from 'vitest';
import { financePaths } from 'src/constants/finance-menu';

import { bankAccountReturnTo, readBankAccountEntryContext } from './bankAccountEntryContext';

const destination = `${financePaths.accounts.settings.bankAccounts}?bankActivity=bank-1&bankTab=activity`;
const params = (changes: Record<string, string> = {}) =>
  new URLSearchParams({
    bankAccountId: 'bank-1',
    academicYearId: 'year-1',
    action: 'add',
    returnTo: destination,
    ...changes,
  });

describe('bank account entry navigation', () => {
  it('retains the bank dialog context in a local return destination', () => {
    expect(bankAccountReturnTo(destination)).toBe(destination);
    expect(readBankAccountEntryContext(params(), 'year-1', 'add')).toEqual({
      bankAccountId: 'bank-1',
      returnTo: destination,
    });
  });

  it.each([
    'https://example.com/finance/settings/bank-account-management?bankActivity=bank-1',
    '//example.com/finance/settings/bank-account-management?bankActivity=bank-1',
    // eslint-disable-next-line no-script-url -- Adversarial input verifies that return navigation rejects executable URLs.
    'javascript:alert(1)',
    '/finance/income-tracking?bankActivity=bank-1',
    `${financePaths.accounts.settings.bankAccounts}?returnTo=https://example.com`,
    `${financePaths.accounts.settings.bankAccounts}\\evil?bankActivity=bank-1`,
  ])('rejects an unsafe or unrelated return destination %s', (url) => {
    expect(bankAccountReturnTo(url)).toBeNull();
  });

  it('does not open an entry for another academic year or another operation', () => {
    expect(readBankAccountEntryContext(params(), 'year-2', 'add')).toBeNull();
    expect(readBankAccountEntryContext(params(), 'year-1', 'deposit')).toBeNull();
    expect(readBankAccountEntryContext(params({ bankAccountId: '' }), 'year-1', 'add')).toBeNull();
    expect(
      readBankAccountEntryContext(params({ returnTo: '/finance/dashboard' }), 'year-1', 'add')
    ).toBeNull();
  });
});
