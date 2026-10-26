import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { vi, it, expect } from 'vitest';
import { Chip, TableRow, TableCell } from '@mui/material';
import { render, renderHook } from '@testing-library/react';
import { useTableData } from 'src/components/customizabaleTable/hooks/useTableData';
import { getCellValueForExport } from 'src/components/customizabaleTable/table-export';
import { useTableConfig } from 'src/components/customizabaleTable/hooks/useTableConfig';

import { SectionTable } from './HRPolicySharedUI';

const table = vi.hoisted(() => vi.fn());
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    table(props);
    return null;
  },
}));

it('offers named categorical choices from complete local policy detail cells', () => {
  render(
    <SectionTable columns={['Status', 'Type']}>
      <TableRow>
        <TableCell>
          <Chip label="Matched" />
        </TableCell>
        <TableCell>Teaching</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Chip label="Skipped" />
        </TableCell>
        <TableCell>Non teaching</TableCell>
      </TableRow>
    </SectionTable>
  );
  const props = table.mock.lastCall![0] as ICustomizableTableProps;
  expect(props.columns[0].filterType).toBe('enum');
  expect(props.columns[0].enumOptions).toEqual([
    { label: 'Matched', value: 'Matched' },
    { label: 'Skipped', value: 'Skipped' },
  ]);
  expect(props.columns[0].filterValue?.(props.data[0].column0, props.data[0])).toBe('Matched');
});

it('sorts rich policy cells by visible text and filters numeric priorities before pagination/export', () => {
  render(
    <SectionTable
      columns={['Staff', 'Priority', 'Actions']}
      columnDefinitions={[{}, { filterType: 'number' }, {}]}
    >
      <TableRow>
        <TableCell>
          <Chip label="Zulu" />
        </TableCell>
        <TableCell>{10}</TableCell>
        <TableCell>Open Zulu</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Chip label="Alpha" />
        </TableCell>
        <TableCell>{2}</TableCell>
        <TableCell>Open Alpha</TableCell>
      </TableRow>
    </SectionTable>
  );
  const props = table.mock.lastCall![0] as ICustomizableTableProps;
  const { result } = renderHook(() => {
    const { tableConfig } = useTableConfig({ columns: props.columns });
    return useTableData({
      data: props.data,
      columns: props.columns,
      config: {
        ...tableConfig,
        sorts: [{ column: 'column0', direction: 'asc' }],
        filters: [{ column: 'column1', type: 'lessThan', value: 3, valueType: 'number' }],
      },
    });
  });
  expect(result.current.sortedData).toHaveLength(1);
  expect(getCellValueForExport(result.current.sortedData[0], props.columns[0])).toBe('Alpha');
  expect(props.columns[2]).toMatchObject({
    isSort: false,
    isFilter: false,
    excludeFromExport: true,
  });
  expect(props.columns[0].sortValue?.(props.data[0].column0, props.data[0])).toBe('zulu');
});

it('preserves caller empty content and keeps server-paged criteria owned by the endpoint', () => {
  render(
    <SectionTable
      columns={['Version']}
      noDataText="No matching versions."
      serverSidePagination
      onServerPagination={vi.fn()}
    >
      {null}
    </SectionTable>
  );
  const props = table.mock.lastCall![0] as ICustomizableTableProps;
  expect(props.noDataText).toBe('No matching versions.');
  expect(props.serverSidePagination).toBe(true);
  expect(props.onServerSort).toBeUndefined();
  expect(props.onServerFilter).toBeUndefined();
});
