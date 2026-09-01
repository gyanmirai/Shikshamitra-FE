import { it, expect, describe } from 'vitest';

import { canDeleteConcessionType } from './ConcessionTable';

describe('canDeleteConcessionType', () => {
  it('does not allow an active concession type to be deleted', () => {
    expect(
      canDeleteConcessionType({
        id: 'active',
        name: 'Active type',
        isActive: true,
        canDelete: true,
      })
    ).toBe(false);
  });

  it('allows an inactive unused concession type to be deleted', () => {
    expect(
      canDeleteConcessionType({
        id: 'inactive',
        name: 'Inactive type',
        isActive: false,
        canDelete: true,
      })
    ).toBe(true);
  });

  it('does not allow an inactive used concession type to be deleted', () => {
    expect(
      canDeleteConcessionType({
        id: 'used',
        name: 'Used type',
        isActive: false,
        isUsedInDownstream: true,
        canDelete: false,
      })
    ).toBe(false);
  });
});
