import { it, expect, describe } from 'vitest';

import { parseEnrollmentTablePagination } from './workspace-table-pagination';

describe('Enrollment workspace table pagination', () => {
  it('converts a one-based URL page into the table zero-based page', () => {
    expect(parseEnrollmentTablePagination(new URLSearchParams('page=3&pageSize=50'))).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it.each([
    'page=abc&pageSize=abc',
    'page=0&pageSize=0',
    'page=-3&pageSize=-20',
    'page=1.5&pageSize=12.5',
  ])('falls back safely for malformed pagination values: %s', (query) => {
    expect(parseEnrollmentTablePagination(new URLSearchParams(query))).toEqual({
      page: 0,
      pageSize: 25,
    });
  });

  it('bounds valid page sizes to the supported server range', () => {
    expect(parseEnrollmentTablePagination(new URLSearchParams('pageSize=5')).pageSize).toBe(10);
    expect(parseEnrollmentTablePagination(new URLSearchParams('pageSize=500')).pageSize).toBe(100);
  });

  it('normalizes in-range deep links to a page size rendered by the paginator', () => {
    expect(parseEnrollmentTablePagination(new URLSearchParams('pageSize=37')).pageSize).toBe(25);
  });
});
