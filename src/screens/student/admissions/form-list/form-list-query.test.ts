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

  it('sends the selected form purpose to the backend', () => {
    expect(
      buildAdmissionFormListQuery({
        page: 0,
        rowsPerPage: 10,
        search: '',
        filters: [],
        purpose: 0,
      })
    ).toMatchObject({ purpose: 0 });
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

  it('sends text and numeric criteria without presentation labels and retains tab scope', () => {
    expect(
      buildAdmissionFormListQuery({
        page: 2,
        rowsPerPage: 10,
        purpose: 1,
        search: ' parent ',
        filters: [
          {
            column: 'name',
            type: 'startsWith',
            value: 'Fresh',
            valueType: 'string',
            label: 'Form',
          },
          { column: 'version', type: 'greaterThan', value: '1', valueType: 'number' },
          {
            column: 'sectionCount',
            type: 'between',
            value: { min: '0', max: '4' },
            valueType: 'number',
          },
          { column: 'purpose', type: 'equals', value: 0, valueType: 'enum' },
        ],
      })
    ).toEqual({
      search: 'parent',
      purpose: 1,
      status: undefined,
      skipCount: 20,
      maxResultCount: 10,
      columnFilters:
        '[{"column":"name","type":"startsWith","value":"Fresh","valueType":"string"},{"column":"version","type":"greaterThan","value":1,"valueType":"number"},{"column":"sectionCount","type":"between","value":{"min":0,"max":4},"valueType":"number"}]',
    });
  });

  it('uses the latest lifecycle choice rather than retaining an older status', () => {
    expect(
      getAdmissionFormStatusFilter([
        { column: 'status', type: 'equals', value: 1, valueType: 'enum' },
        { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
      ])
    ).toBe(0);
  });

  it('does not turn an empty status into Draft', () => {
    expect(
      getAdmissionFormStatusFilter([
        { column: 'status', type: 'equals', value: '', valueType: 'enum' },
      ])
    ).toBeUndefined();
  });
});
