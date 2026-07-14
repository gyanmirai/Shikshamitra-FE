import { it, expect, describe } from 'vitest';

import { reconcileColumnVisibility } from './useTableConfig';

describe('reconcileColumnVisibility', () => {
  it('preserves user choices when a parent recreates its column definitions', () => {
    expect(
      reconcileColumnVisibility(
        [
          { id: 'name', label: 'Name' },
          { id: 'status', label: 'Status' },
          { id: 'newColumn', label: 'New', defaultHidden: true },
        ],
        { name: true, status: false, removed: true }
      )
    ).toEqual({ name: true, status: false, newColumn: false });
  });
});
