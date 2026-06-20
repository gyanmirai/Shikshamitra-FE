import { it, expect, describe } from 'vitest';

import { extractRollNumberProjectionItems } from './roll-number-projections';

describe('extractRollNumberProjectionItems', () => {
  it('reads the official roll projection object response shape', () => {
    const items = [{ studentId: 'student-1', rollNo: 1 }];

    expect(
      extractRollNumberProjectionItems({
        data: {
          totalCount: 1,
          currentPage: 1,
          pageSize: 1,
          totalPages: 1,
          items,
        },
      })
    ).toBe(items);
  });

  it('keeps compatibility with the prior array response shape', () => {
    const items = [{ studentId: 'student-1', rollNo: 1 }];

    expect(extractRollNumberProjectionItems({ data: items })).toBe(items);
  });

  it('returns null for empty or invalid payloads', () => {
    expect(extractRollNumberProjectionItems(null)).toBeNull();
    expect(extractRollNumberProjectionItems({})).toBeNull();
    expect(extractRollNumberProjectionItems({ data: { items: null } })).toBeNull();
  });
});
