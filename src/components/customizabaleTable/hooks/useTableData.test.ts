import { it, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useTableData } from './useTableData';

import type { IParams, IColumn } from '../types';

const columns: IColumn[] = [
  {
    id: 'status',
    label: 'Status',
    filterType: 'enum',
    enumOptions: [
      { label: 'Draft', value: 0 },
      { label: 'Published', value: 1 },
    ],
    render: () => 'Published',
  },
];

const createConfig = (value: number | string): IParams => ({
  page: 0,
  rowsPerPage: 10,
  searchTerm: '',
  filterColumn: '',
  filterType: '',
  dense: false,
  columnSearchTerm: '',
  filters: [
    {
      column: 'status',
      type: 'equals',
      value,
      valueType: 'enum',
      label: 'Status',
      displayValue: 'Published',
    },
  ],
  sorts: [],
  dateFilter: null,
  dateRangeFilter: { start: null, end: null },
  filterValue: '',
  columnVisibility: { status: true },
});

describe('useTableData enum filtering', () => {
  it('matches a rendered enum cell using its raw numeric value', () => {
    const publishedRubric = { id: 'rubric-1', status: 1 };
    const { result } = renderHook(() =>
      useTableData({ data: [publishedRubric], columns, config: createConfig(1) })
    );

    expect(result.current.filteredData).toEqual([publishedRubric]);
  });

  it('normalizes select string values without matching a different status', () => {
    const rows = [
      { id: 'rubric-1', status: 1 },
      { id: 'rubric-2', status: 0 },
    ];
    const { result } = renderHook(() =>
      useTableData({ data: rows, columns, config: createConfig('1') })
    );

    expect(result.current.filteredData).toEqual([rows[0]]);
  });
});
