import { it, expect, describe } from 'vitest';

import { formatHistoryValue } from './account-setting-history-formatters';

describe('Accounts history values', () => {
  it('preserves missing, boolean, list, and plain-text audit values', () => {
    expect(formatHistoryValue(null, 'Name')).toBe('Not set');
    expect(formatHistoryValue('null', 'Name')).toBe('Not set');
    expect(formatHistoryValue('false', 'IsActive')).toBe('Inactive');
    expect(formatHistoryValue('true', 'IsActive')).toBe('Active');
    expect(formatHistoryValue('["tuition","fees"]', 'Tags')).toBe('tuition, fees');
    expect(formatHistoryValue('[]', 'Tags')).toBe('Not set');
    expect(formatHistoryValue('School fees', 'Name')).toBe('School fees');
    expect(formatHistoryValue('0', 'AccountType')).toBe('Saving');
    expect(formatHistoryValue('1', 'AccountType')).toBe('Current');
  });

  it('masks bank account numbers in both serialized and legacy history', () => {
    expect(formatHistoryValue('"123456789012"', 'AccountNumber')).toBe('•••• 9012');
    expect(formatHistoryValue('123456789012', 'AccountNumber')).toBe('•••• 9012');
    expect(formatHistoryValue('"012345678901"', 'AccountNumber')).toBe('•••• 8901');
    expect(formatHistoryValue('"123"', 'AccountNumber')).toBe('••••');
    expect(formatHistoryValue('12345678901234567890', 'AccountNumber')).toBe('•••• 7890');
  });
});
