import { describe, expect, it } from 'vitest';

import { feeCollectionRowId } from './feeCollectionRowId';

describe('fee collection row identity', () => {
  it('keeps separate linked fee accounts for the same student distinct', () => {
    expect(feeCollectionRowId({ studentId: 'student-1', financeFeeAccountId: 'account-a' })).toBe('account-a');
    expect(feeCollectionRowId({ studentId: 'student-1', financeFeeAccountId: 'account-b' })).toBe('account-b');
    expect(feeCollectionRowId({ studentId: 'student-1' })).toBe('student-1');
  });
});
