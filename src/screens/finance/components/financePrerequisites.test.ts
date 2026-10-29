import { it, expect, describe } from 'vitest';

import { isFinancePrerequisiteMissing } from './financePrerequisites';

describe('finance prerequisite detection', () => {
  it('requires a completed empty result rather than unknown, loading, failed or skipped data', () => {
    expect(isFinancePrerequisiteMissing({ options: undefined })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [], isFetching: true })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [], isLoading: true })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [], isError: true })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [], isUninitialized: true })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [] })).toBe(true);
  });

  it('keeps optional setup and a real None category usable', () => {
    expect(isFinancePrerequisiteMissing({ options: [], required: false })).toBe(false);
    expect(isFinancePrerequisiteMissing({ options: [{ id: 'none', label: 'None' }] })).toBe(false);
  });
});
