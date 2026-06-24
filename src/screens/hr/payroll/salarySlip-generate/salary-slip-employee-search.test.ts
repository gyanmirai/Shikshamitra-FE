import { it, expect, describe } from 'vitest';

import { hasMoreEmployeeSearchPages } from './salary-slip-employee-search';

describe('salary slip employee search pagination', () => {
  it('does not request more pages when an empty search returns zero total pages', () => {
    expect(hasMoreEmployeeSearchPages({ currentPage: 1, totalPages: 0 })).toBe(false);
  });

  it('uses strict less-than pagination when total pages are available', () => {
    expect(hasMoreEmployeeSearchPages({ currentPage: 1, totalPages: 2 })).toBe(true);
    expect(hasMoreEmployeeSearchPages({ currentPage: 2, totalPages: 2 })).toBe(false);
    expect(hasMoreEmployeeSearchPages({ currentPage: 3, totalPages: 2 })).toBe(false);
  });

  it('falls back to total count when total pages are absent', () => {
    expect(hasMoreEmployeeSearchPages({ currentPage: 1, pageSize: 10, totalCount: 11 })).toBe(true);
    expect(hasMoreEmployeeSearchPages({ currentPage: 2, pageSize: 10, totalCount: 11 })).toBe(
      false
    );
  });
});
