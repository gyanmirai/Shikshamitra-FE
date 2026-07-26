import { it, expect, describe } from 'vitest';

import { shouldShowQueryMutationError } from './customQueryAndMutation';

describe('custom query and mutation error ownership', () => {
  it('suppresses the automatic toast only when the caller explicitly disables it', () => {
    expect(shouldShowQueryMutationError(true, false)).toBe(false);
  });

  it('preserves automatic error feedback regardless of legacy throw intent', () => {
    expect(shouldShowQueryMutationError(true, true)).toBe(true);
  });
});
