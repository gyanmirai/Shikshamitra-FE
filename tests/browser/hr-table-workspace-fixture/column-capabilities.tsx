import { useState } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';
import { getHrAuditValueText } from 'src/utils/hr-audit-format';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { isRegisterQueryLocked } from 'src/screens/hr/attendance-tracking/table-query-guard';
import { SalaryDetailsTableCard } from 'src/screens/hr/payroll/run-payroll/salary-details-table-card';
import { staffDirectoryDataColumns } from 'src/screens/hr/employee/staff-directory-column-capabilities';
import {
  type EmployeeICardRow,
  createICardStaffColumns,
} from 'src/screens/hr/i-card/i-card-staff-columns';

import { useSyntheticRead } from './operational-api';

export function ColumnCapabilities({
  kind,
}: {
  kind: 'directory' | 'icard' | 'register' | 'salary' | 'audit';
}) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [selected, setSelected] = useState<Record<string, EmployeeICardRow>>({});
  const [editRow, setEditRow] = useState<EmployeeICardRow | null>(null);
  const [saving, setSaving] = useState(false);
  const locked = isRegisterQueryLocked({
    editRow,
    bulkOpen: false,
    isAdjusting: saving,
    isBulkAdjusting: false,
  });
  const table =
    kind === 'directory'
      ? 'employee-table'
      : kind === 'icard'
        ? 'employee-icard-selection-table'
        : 'hr-attendance-register';
  const query = { fixtureKind: kind, fixtureState: 'normal' };
  const view = useHrTableQuery(
    { table, query, page, size, resetPage: () => setPage(0), genericSearch: true, locked },
    useSyntheticRead('typed-list', { query, offset: page * size, size })
  );
  const exportAll = useHrTableExport(table, query);
  const rows = view.currentData?.items || [];
  const toggle = (row: EmployeeICardRow) =>
    setSelected((current) => {
      const next = { ...current };
      if (next[row.id]) delete next[row.id];
      else next[row.id] = row;
      return next;
    });
  if (kind === 'salary')
    return (
      <SalaryDetailsTableCard
        title="Earnings"
        tableId="browser-salary-lines"
        data={[
          { name: 'Alpha', amount: 100 },
          { name: 'Middle', amount: 10 },
          { name: 'Zulu', amount: 2.5 },
        ]}
        noDataText="No components"
      />
    );
  if (kind === 'audit')
    return (
      <CustomizableTable
        tableId="browser-audit-values"
        tableTitle="Audit changes"
        data={[
          { id: 'week', field: 'customWeeklyOffs', oldValue: [1] },
          {
            id: 'reference',
            field: 'sourcePolicyId',
            oldValue: '3a216aea-8273-8586-a1a3-3bffdc298e2e',
          },
          { id: 'date', field: 'effectiveFrom', oldValue: '2026-10-26' },
        ]}
        columns={[
          { id: 'field', label: 'Field' },
          {
            id: 'oldValue',
            label: 'Before',
            filterType: 'string',
            render: (value, row) => getHrAuditValueText(value, row.field),
            filterValue: (value, row) => getHrAuditValueText(value, row.field),
            sortValue: (value, row) => getHrAuditValueText(value, row.field),
            searchValue: (value, row) => getHrAuditValueText(value, row.field),
            exportValue: (value, row) => getHrAuditValueText(value, row.field),
          },
        ]}
        exportScope="all"
      />
    );
  const columns =
    kind === 'directory'
      ? [
          ...staffDirectoryDataColumns.map((column) => ({
            ...column,
            minWidth: 125,
            render:
              column.id === 'fullName'
                ? (_: unknown, row: any) => `${row.fullName} (${row.employeeIdentifier})`
                : column.id === 'isTeaching'
                  ? (value: unknown) => (value ? 'Teaching' : 'Non-teaching')
                  : undefined,
          })),
          { id: 'actions', label: 'Actions', isSort: false, isFilter: false, render: () => 'View' },
        ]
      : kind === 'icard'
        ? createICardStaffColumns({
            selectedEmployeeIds: Object.keys(selected),
            allVisibleSelected: rows.length > 0 && rows.every((row: any) => selected[row.id]),
            someVisibleSelected: rows.some((row: any) => selected[row.id]),
            toggleEmployeeSelection: toggle,
            toggleVisibleSelection: (checked) =>
              setSelected((current) => {
                const next = { ...current };
                rows.forEach((row: EmployeeICardRow) => {
                  if (checked) next[row.id] = row;
                  else delete next[row.id];
                });
                return next;
              }),
          })
        : [
            { id: 'employeeName', label: 'Staff' },
            { id: 'present', label: 'Attendance', filterType: 'number' as const },
            { id: 'exceptions', label: 'Exceptions' },
            {
              id: 'employeeGroup',
              label: 'Group',
              filterType: 'enum' as const,
              enumOptions: [
                { label: 'Teaching', value: 'Teaching' },
                { label: 'Non teaching', value: 'NonTeaching' },
              ],
            },
            { id: 'department', label: 'Department' },
            { id: 'editability', label: 'Editability' },
          ];
  return (
    <>
      {kind === 'icard' && (
        <Typography aria-label="Selected staff IDs">{Object.keys(selected).join(', ')}</Typography>
      )}
      {kind === 'register' && (
        <Stack direction="row" gap={1}>
          <Button onClick={() => setEditRow(rows[0])}>Open adjustment</Button>
          <Button onClick={() => setEditRow(null)}>Cancel adjustment</Button>
          <Button onClick={() => setSaving(true)}>Start save</Button>
          <Button
            onClick={() => {
              setSaving(false);
              setEditRow(null);
            }}
          >
            Finish save
          </Button>
          <Typography aria-label="Adjustment context">
            {editRow?.fullName || 'No adjustment'}
          </Typography>
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomizableTable
          tableId={`browser-${kind}-columns`}
          tableTitle={
            kind === 'directory'
              ? 'Staff directory'
              : kind === 'icard'
                ? 'Staff selection'
                : 'Attendance register'
          }
          columns={columns}
          data={rows}
          totalCount={view.currentData?.totalCount || 0}
          serverSidePagination
          page={page}
          rowsPerPage={size}
          onServerPagination={(next, count) => {
            if (locked) return;
            setPage(next - 1);
            setSize(count);
          }}
          paginationDisabled={locked}
          searchFieldProps={{ disabled: locked }}
          isLoading={view.isFetching}
          error={view.error}
          onRetry={view.refetch}
          showExport={kind !== 'icard'}
          onExport={exportAll}
          exportScope="all"
          {...view.tableProps}
          wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        />
      </Box>
    </>
  );
}
