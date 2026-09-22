import { it, expect, describe } from 'vitest';

import { buildAdmissionFormListQuery, getAdmissionFormStatusFilter } from './form-list-query';

describe('admission form list query', () => {
  it('converts zero-based table paging into backend skip and take values', () => {
    expect(
      buildAdmissionFormListQuery({ page: 2, rowsPerPage: 25, search: '  enquiry ', filters: [] })
    ).toEqual({
      search: 'enquiry',
      status: undefined,
      skipCount: 50,
      maxResultCount: 25,
    });
  });

  it('keeps Draft status even though its value is zero', () => {
    expect(
      getAdmissionFormStatusFilter([
        {
          column: 'status',
          type: 'equals',
          value: 0,
          valueType: 'enum',
        },
      ])
    ).toBe(0);
  });

  it('ignores unsupported status values', () => {
    expect(
      getAdmissionFormStatusFilter([
        {
          column: 'status',
          type: 'equals',
          value: 7,
          valueType: 'enum',
        },
      ])
    ).toBeUndefined();
  });
});
