import { describe, expect, it, vi } from 'vitest';

import { createSubstitutionSegments } from './create-substitution-action';

describe('createSubstitutionSegments', () => {
  it('resets mutation state after every segment succeeds', async () => {
    const resetMutation = vi.fn();

    await expect(
      createSubstitutionSegments({
        segments: ['first', 'second'],
        create: async (segment) => `${segment}-created`,
        resetMutation,
      })
    ).resolves.toEqual(['first-created', 'second-created']);

    expect(resetMutation).toHaveBeenCalledTimes(1);
  });

  it('resets mutation state when any segment fails', async () => {
    const resetMutation = vi.fn();

    await expect(
      createSubstitutionSegments({
        segments: ['failed'],
        create: async () => {
          throw new Error('create failed');
        },
        resetMutation,
      })
    ).rejects.toThrow('create failed');

    expect(resetMutation).toHaveBeenCalledTimes(1);
  });
});
