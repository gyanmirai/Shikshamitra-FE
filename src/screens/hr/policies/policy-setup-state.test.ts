import { describe, expect, it } from 'vitest';
import { getDefaultPolicySetupState, getErrorMessage } from './hr-policy-workspace-utils';

const items = [{ isDefault: false }];
const complete = { items, totalCount: 1 };
describe('authoritative default policy setup state', () => {
  it.each([
    { data: undefined, loading: false },
    { data: complete, loading: true },
    { data: complete, loading: false, error: new Error('unavailable') },
    { data: { items, totalCount: 200 }, loading: false },
    { data: { items }, loading: false },
  ])('does not claim missing setup from unavailable or incomplete data: %j', (query) => {
    expect(getDefaultPolicySetupState({ ...query, items })).toBe('unknown');
  });
  it('distinguishes missing, unique and multiple defaults', () => {
    (
      [
        [0, 'missing'],
        [1, 'ready'],
        [2, 'multiple'],
      ] as const
    ).forEach(([count, state]) => {
      const defaults = Array.from({ length: count }, () => ({ isDefault: true }));
      expect(
        getDefaultPolicySetupState({
          data: { items: defaults, totalCount: count },
          loading: false,
          items: defaults,
        })
      ).toBe(state);
    });
  });
  it('handles the leave API totalRecords envelope', () => {
    expect(
      getDefaultPolicySetupState({
        data: { items: [], totalRecords: 0 },
        loading: false,
        items: [],
      })
    ).toBe('missing');
  });
  it('shortens only an explicit sole-default guard, preserving other uses of the error code', () => {
    const error = {
      code: 'ShikshaMitra:DefaultAttendancePolicyRequired',
      message: 'Inactive policy reference',
    };
    expect(getErrorMessage({ data: { error } }, 'fallback')).toBe('Inactive policy reference');
    expect(
      getErrorMessage(
        { data: { error: { ...error, data: { reason: 'sole-default' } } } },
        'fallback'
      )
    ).toBe('Choose another default before archiving');
  });
});
