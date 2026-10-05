import { it, expect, describe } from 'vitest';

import { bankAccountOptionLabel } from './bankAccountOptionLabel';

describe('bank account option labels', () => {
  it.each(['SBI • 1234', 'SBI - XXXX1234', 'SBI - School Operating Account', 'Co-operative Bank'])(
    'preserves the safe server identifier %s',
    (label) => expect(bankAccountOptionLabel({ id: 'bank', label })).toBe(label)
  );

  it.each(['SBI - null', 'SBI-null', 'SBI - undefined', 'SBI • NULL', 'SBI | undefined', 'SBI - '])(
    'removes missing identifier tokens from %s',
    (label) => expect(bankAccountOptionLabel({ id: 'bank', label })).toBe('SBI')
  );

  it.each([null, undefined, '', '  ', 'null', ' UNDEFINED '])(
    'uses a clear fallback for a missing label %s',
    (label) =>
      expect(bankAccountOptionLabel({ id: 'bank', label })).toBe(
        'Bank account (details unavailable)'
      )
  );

  it('uses the redacted master-data identifier when the full account number is unavailable', () => {
    const account = {
      id: 'bank',
      bankName: ' SBI ',
      accountNumber: null,
      maskedAccountNumber: '********1234',
      accountHolderName: 'School Operating Account',
    };
    expect(bankAccountOptionLabel(account)).toBe('SBI - ********1234');
  });

  it('repairs a malformed label using the masked identifier when supplied', () => {
    expect(
      bankAccountOptionLabel({ id: 'bank', label: 'SBI - null', maskedAccountNumber: 'XXXX1234' })
    ).toBe('SBI - XXXX1234');
  });

  it('falls back to the account holder then bank name when the masked identifier is unavailable', () => {
    expect(
      bankAccountOptionLabel({ id: 'bank', bankName: 'SBI', accountHolderName: 'School Account' })
    ).toBe('SBI - School Account');
    expect(
      bankAccountOptionLabel({ id: 'bank', bankName: 'SBI', maskedAccountNumber: 'null' })
    ).toBe('SBI');
  });

  it('preserves meaningful names containing placeholder words or hyphens', () => {
    expect(
      bankAccountOptionLabel({ id: 'bank', label: 'Null Valley Bank - Undefined School Account' })
    ).toBe('Null Valley Bank - Undefined School Account');
  });

  it('never reads a full account number as a fallback', () => {
    const account = { id: 'bank', bankName: 'SBI', accountNumber: '123456789012' };
    expect(bankAccountOptionLabel(account)).toBe('SBI');
  });
});
