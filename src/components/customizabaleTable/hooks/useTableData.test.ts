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

describe('server search ownership', () => {
  const rows = [
    { id: 'employee-1', fullName: 'Abhay Bamrotiya', status: 1 },
    { id: 'employee-2', fullName: 'Abhay Shah', status: 0 },
  ];
  const employeeColumns = [...columns, { id: 'fullName', label: 'Name' }];

  it('retains local column filters when only search is performed by the server', () => {
    const { result } = renderHook(() =>
      useTableData({
        data: rows,
        columns: employeeColumns,
        config: { ...createConfig(1), searchTerm: 'Abhay Kumar Bamrotiya' },
        serverSideSearch: true,
      })
    );
    expect(result.current.filteredData).toEqual([rows[0]]);
  });

  it('still searches visible cells locally for client-side tables', () => {
    const { result } = renderHook(() =>
      useTableData({
        data: rows,
        columns: employeeColumns,
        config: {
          ...createConfig(1),
          filters: [],
          searchTerm: 'bamrotiya',
          columnVisibility: { fullName: true },
        },
      })
    );
    expect(result.current.filteredData).toEqual([rows[0]]);
  });

  it('does not discard server matches when their name column is hidden', () => {
    const { result } = renderHook(() =>
      useTableData({
        data: [rows[0]],
        columns: employeeColumns,
        config: { ...createConfig(1), searchTerm: 'Abhay Bamrotiya' },
        serverSideSearch: true,
      })
    );
    expect(result.current.filteredData).toEqual([rows[0]]);
  });
});

it('retains local search when the server owns column filters', () => {
  const { result } = renderHook(() =>
    useTableData({
      data: [
        { status: 1, name: 'Alpha' },
        { status: 1, name: 'Zulu' },
      ],
      columns: [{ id: 'name', label: 'Staff' }],
      config: { ...createConfig(1), searchTerm: 'alpha', columnVisibility: { name: true } },
      serverSideFilter: true,
    })
  );
  expect(result.current.filteredData.map((row) => row.name)).toEqual(['Alpha']);
});

it('sorts unlimited domain values independently of stored zeros and keeps stable secondary sorts', () => {
  const data = [
    { id: 'unlimited', available: 0, unlimited: true },
    { id: 'finite-b', available: 2 },
    { id: 'finite-a', available: 2 },
    { id: 'empty', available: 0 },
  ];
  const { result } = renderHook(() =>
    useTableData({
      data,
      columns: [
        {
          id: 'available',
          label: 'Available',
          filterType: 'number',
          sortValue: (value, row) => (row.unlimited ? Infinity : Number(value)),
        },
        { id: 'id', label: 'Staff' },
      ],
      config: {
        ...createConfig(1),
        filters: [],
        columnVisibility: { available: true, id: true },
        sorts: [
          { column: 'available', direction: 'asc' },
          { column: 'id', direction: 'asc' },
        ],
      },
    })
  );
  expect(result.current.sortedData.map((row) => row.id)).toEqual([
    'empty',
    'finite-a',
    'finite-b',
    'unlimited',
  ]);
  expect(data[0].available).toBe(0);
});
