'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FinanceDashboardClass } from 'src/redux/finance/financeDashboardApi';

import { useId, useState } from 'react';
import { fNumber } from 'src/utils/format-number';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';

import { dashboardNumberSx, formatDashboardMoney } from '../finance-dashboard-format';

const tableTitle = 'Outstanding Fees by Class';
const optionOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const numericCellSx = { textAlign: 'right', whiteSpace: 'nowrap', ...dashboardNumberSx };
const numericHeaderSx = { '& .customizable-table-header-content': { whiteSpace: 'normal' } };

const amountColumns = [
  { id: 'outstanding', label: 'Outstanding', minWidth: 164 },
  { id: 'overdue', label: 'Overdue', minWidth: 128 },
  { id: 'separateCharges', label: 'Separate charges', minWidth: 146 },
].map((column): IColumn => ({
  ...column,
  align: 'left',
  cellSx: numericCellSx,
  headerSx: numericHeaderSx,
  filterType: 'number',
  valueType: 'money',
  isFilter: true,
  isSort: true,
  render: (value: number | null) => (
    <Typography
      component="span"
      variant="inherit"
      color={column.id === 'overdue' && value && value > 0 ? 'error.main' : undefined}
    >
      {value === null ? '—' : formatDashboardMoney(value)}
    </Typography>
  ),
}));

const studentsColumn: IColumn = {
  id: 'studentsWithOverdueFees',
  label: 'Students with overdue fees',
  minWidth: 156,
  align: 'left',
  cellSx: numericCellSx,
  headerSx: numericHeaderSx,
  filterType: 'number',
  filterStep: 1,
  valueType: 'number',
  isFilter: true,
  isSort: true,
  render: (value: number) => fNumber(value),
};

const classColumn: IColumn = {
  id: 'classLabel',
  label: 'Class',
  rowHeader: true,
  minWidth: 152,
  sticky: true,
  stickyPosition: 'left',
  stickyOnMobile: false,
  filterType: 'string',
  filterValue: (_value, row) => row.className,
  isFilter: true,
  isSort: true,
  render: (value: string) => (
    <Typography
      component="span"
      variant="inherit"
      sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
    >
      {value}
    </Typography>
  ),
};

const boardKey = (row: FinanceDashboardClass) =>
  row.boardId && row.mediumId ? `${row.boardId}:${row.mediumId}` : '';

export default function ExposureAtlas({
  classes,
  yearLabel,
  periodLabel,
}: {
  classes: FinanceDashboardClass[];
  yearLabel: string;
  periodLabel: string;
}) {
  const headingId = useId();
  const [boardMedium, setBoardMedium] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [page, setPage] = useState(0);

  const boardOptions = [
    ...new Map(
      classes
        .filter((row) => row.boardMedium && boardKey(row))
        .map((row) => [boardKey(row), row.boardMedium!])
    ),
  ]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => optionOrder.compare(a.label, b.label));
  const boardOption = boardOptions.find((option) => option.value === boardMedium);
  const activeBoard = boardOption?.value ?? 'all';
  const matching = classes.filter((row) => activeBoard === 'all' || boardKey(row) === activeBoard);
  const names = new Set<string>();
  const duplicates = new Set<string>();
  matching.forEach((row) => {
    if (names.has(row.className)) duplicates.add(row.className);
    names.add(row.className);
  });
  const rows = matching.map((row) => ({
    ...row,
    id: row.classId ?? 'unassigned',
    classLabel:
      duplicates.has(row.className) && row.boardMedium
        ? `${row.className} · ${row.boardMedium}`
        : row.className,
  }));
  const classOption = rows.find((row) => row.id === selectedClass);
  const activeClass = classOption?.id ?? 'all';
  const filteredRows = activeClass === 'all' ? rows : rows.filter((row) => row.id === activeClass);
  const canViewCharges = classes.some((row) => row.separateCharges !== null);
  const columns = [
    classColumn,
    ...amountColumns.slice(0, 2),
    studentsColumn,
    ...(canViewCharges ? [amountColumns[2]] : []),
  ];

  const changeBoardMedium = (next: string) => {
    setBoardMedium(next);
    if (
      classOption &&
      next !== 'all' &&
      !classes.some((row) => row.classId === classOption.classId && boardKey(row) === next)
    ) {
      setSelectedClass('all');
    }
    setPage(0);
  };

  return (
    <Stack component="section" aria-labelledby={headingId} spacing={1} sx={{ minWidth: 0 }}>
      <Box sx={{ px: 1 }}>
        <FormSectionHeader
          title={tableTitle}
          titleTypographyProps={{ id: headingId }}
          description={boardOptions.length === 1 ? boardOptions[0].label : undefined}
          descriptionTooltip="Current unpaid fees and approved charges due in the selected period. Overdue amounts are determined as of today."
        />
      </Box>
      {rows.length > 0 && (
        <Paper
          role="group"
          aria-label="Class table scope"
          variant="outlined"
          sx={{ p: 1, borderRadius: 2 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            useFlexGap
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: boardOptions.length > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                },
                gap: 1,
                flex: 1,
                maxWidth: { sm: boardOptions.length > 1 ? 480 : 236 },
              }}
            >
              {boardOptions.length > 1 && (
                <CustomSelect
                  name="boardMedium"
                  label="Board and medium"
                  value={activeBoard}
                  onChange={(value) => changeBoardMedium(String(value))}
                  options={[{ label: 'All boards and mediums', value: 'all' }, ...boardOptions]}
                  size="small"
                  fullWidth
                />
              )}
              <CustomSelect
                name="class"
                label="Class"
                value={activeClass}
                onChange={(value) => {
                  setSelectedClass(String(value));
                  setPage(0);
                }}
                options={[
                  { label: 'All classes', value: 'all' },
                  ...rows
                    .map((row) => ({ label: row.classLabel, value: row.id }))
                    .sort((a, b) => optionOrder.compare(a.label, b.label)),
                ]}
                size="small"
                fullWidth
                isSearch
                searchPlaceholder="Find a class"
              />
            </Box>
            {(boardOption || classOption) && (
              <Button
                type="button"
                size="small"
                color="inherit"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
                onClick={() => {
                  setBoardMedium('all');
                  setSelectedClass('all');
                  setPage(0);
                }}
              >
                Reset scope
              </Button>
            )}
          </Stack>
        </Paper>
      )}
      <CustomizableTable
        tableId="finance-outstanding-fees-by-class"
        tableTitle={tableTitle}
        columns={columns}
        data={filteredRows}
        page={page}
        onPaginationChange={setPage}
        onSearchInputChange={() => setPage(0)}
        onFiltersChange={() => setPage(0)}
        onSortChange={() => setPage(0)}
        variant="embedded"
        exportScope="all"
        exportDisabled={filteredRows.length === 0}
        exportContext={[
          `Academic year: ${yearLabel}`,
          `Due dates: ${periodLabel}`,
          ...(boardOption ? [`Board and medium: ${boardOption.label}`] : []),
          ...(classOption ? [`Class: ${classOption.classLabel}`] : []),
        ]}
        searchableFields={['classLabel', 'boardMedium']}
        searchFieldProps={{
          placeholder: 'Search class, board, or medium…',
          inputProps: { 'aria-label': 'Search outstanding fees by class' },
        }}
        noDataText="No balances to show for the selected period."
        wrapperProps={{ sx: { minWidth: 0 } }}
        tableContainerProps={{ sx: { maxHeight: 420 } }}
      />
    </Stack>
  );
}
