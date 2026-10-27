import type { IColumn, TableExportRequest } from 'src/components/customizabaleTable/types';
import type { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';
import type {
  StudentDirectoryItem,
  StudentDirectoryColumnFilter,
} from 'src/redux/student/records/student-records-types';

import { useMemo } from 'react';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, Checkbox, Typography } from '@mui/material';

import { directoryStudentName, buildDirectoryColumns } from './student-directory-columns';
import {
  directoryTableFilters,
  serializeDirectoryFilters,
} from './student-directory-column-filters';

import type { DirectoryRowActions } from './student-directory-columns';
import type { StudentPopulation } from './student-directory-filter-panel';

type Props = {
  hasFilters: boolean;
  query: ReturnType<typeof useGetStudentRecordsDirectoryQuery>;
  page: number;
  pageSize: number;
  search: string;
  sorting: string;
  columnFilters: StudentDirectoryColumnFilter[];
  update: (values: Record<string, string | number | undefined>) => void;
  population: StudentPopulation;
  academicYearReady: boolean;
  academicOptionsLoading?: boolean;
  academicContextMessage?: string;
  profileHref: (studentId: string) => string;
  rowActions?: DirectoryRowActions;
  onClearFilters: () => void;
  onProfileOpen: (studentId: string) => void;
  onExport: (request: TableExportRequest) => Promise<void>;
  canPrintIds: boolean;
  canGenerateCertificates: boolean;
  onDocumentAction: (kind: 'id-card' | 'certificate', students: StudentDirectoryItem[]) => void;
  selection: {
    selected: StudentDirectoryItem[];
    enabled: boolean;
    disabledReason: string;
    onToggle: (row: StudentDirectoryItem, checked: boolean) => void;
    onTogglePage: (rows: StudentDirectoryItem[], checked: boolean) => void;
  };
};
export default function StudentDirectoryTable({
  hasFilters,
  query,
  page,
  pageSize,
  search,
  sorting,
  columnFilters,
  update,
  population,
  academicYearReady,
  academicOptionsLoading = false,
  academicContextMessage = 'Select an academic year to view students.',
  profileHref,
  rowActions,
  onClearFilters,
  onProfileOpen,
  onExport,
  canPrintIds,
  canGenerateCertificates,
  onDocumentAction,
  selection,
}: Props) {
  const compact = useResponsive('down', 'sm');
  const rows = useMemo<(StudentDirectoryItem & { name: string; classDivision: string })[]>(
    () =>
      (academicYearReady && !query.isError ? (query.currentData?.items ?? []) : []).map(
        (student: StudentDirectoryItem) => ({
          ...student,
          name: directoryStudentName(student),
          classDivision:
            [student.standardName, student.divisionName].filter(Boolean).join(' / ') || '—',
        })
      ),
    [academicYearReady, query.currentData, query.isError]
  );
  const errorStatus =
    query.error && typeof query.error === 'object' && 'status' in query.error
      ? query.error.status
      : undefined;
  const accessDenied = errorStatus === 401 || errorStatus === 403;
  const selectedIds = new Set(selection.selected.map((row) => row.studentId));
  const selectableRows = rows.filter((row) => !(row.maskedFields ?? []).includes('Identity'));
  const allPageSelected =
    selectableRows.length > 0 && selectableRows.every((row) => selectedIds.has(row.studentId));
  const somePageSelected = selectableRows.some((row) => selectedIds.has(row.studentId));
  const documentActions: DirectoryRowActions = (row) => {
    const actions = rowActions?.(row) ?? [];
    const documents = [
      ...(canGenerateCertificates
        ? [
            {
              id: 'certificate',
              icon: 'mdi:certificate-outline',
              label: `Generate Certificate for ${directoryStudentName(row)}`,
              onClick: () => onDocumentAction('certificate', [row]),
            },
          ]
        : []),
      ...(canPrintIds
        ? [
            {
              id: 'print-id',
              icon: 'mdi:card-account-details-outline',
              label: 'Print I-card',
              onClick: () => onDocumentAction('id-card', [row]),
            },
          ]
        : []),
    ];
    return [
      ...actions.filter((action) => action.id !== 'change-status'),
      ...documents,
      ...actions.filter((action) => action.id === 'change-status'),
    ].map((action) =>
      selection.selected.length
        ? {
            ...action,
            disabled: true,
            tooltip: 'Clear bulk selection to use individual student actions.',
          }
        : action
    );
  };
  const checkbox = (
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    disabled: boolean,
    indeterminate = false
  ) => (
    <CustomTooltip title={disabled ? selection.disabledReason : label} arrow>
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <Checkbox
          size="small"
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          inputProps={{ 'aria-label': label }}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onChange(event.target.checked)}
        />
      </Box>
    </CustomTooltip>
  );
  const selectionColumn: IColumn = {
    id: 'selection',
    align: 'left',
    isSort: false,
    isFilter: false,
    excludeFromExport: true,
    width: 48,
    minWidth: 48,
    headerSx: { px: 1 },
    cellSx: { px: 1 },
    label: checkbox(
      'Select current page',
      allPageSelected,
      (checked) => selection.onTogglePage(selectableRows, checked),
      !selection.enabled || !selectableRows.length,
      !allPageSelected && somePageSelected
    ),
    render: (_value, row) =>
      checkbox(
        `Select ${directoryStudentName(row as StudentDirectoryItem)}`,
        selectedIds.has(row.studentId),
        (checked) => selection.onToggle(row as StudentDirectoryItem, checked),
        !selection.enabled ||
          (row.maskedFields ?? []).includes('Identity') ||
          (selection.selected.length >= 100 && !selectedIds.has(row.studentId))
      ),
  };
  const columns = [
    selectionColumn,
    ...buildDirectoryColumns({ profileHref, rowActions: documentActions, compact }),
  ];

  return (
    <CustomizableTable
      tableId="student-records-directory"
      tableTitle="Student List"
      columns={columns}
      data={rows}
      showColumns
      showExport
      showFullScreen
      exportScope="all"
      onExport={onExport}
      exportDisabled={!academicYearReady || query.isError}
      getRowAction={(row) =>
        selection.selected.length
          ? undefined
          : {
              label: `Open profile for ${directoryStudentName(row as StudentDirectoryItem)}`,
              onClick: () => onProfileOpen(row.studentId),
            }
      }
      rowProps={(row) => ({ selected: selectedIds.has(row.studentId) })}
      isRefreshing={query.isFetching && Boolean(query.currentData) && !query.isError}
      totalCount={academicYearReady && !query.isError ? (query.currentData?.totalCount ?? 0) : 0}
      isLoading={
        academicOptionsLoading ||
        (academicYearReady && (query.isLoading || (query.isFetching && !query.currentData)))
      }
      errorContent={
        !academicYearReady && !academicOptionsLoading ? (
          <StudentFeedback notificationKey="STU-0851" presentation="inline" severity="info">
            {academicContextMessage}
          </StudentFeedback>
        ) : query.isError ? (
          <StudentFeedback
            notificationKey="STU-0852"
            presentation="persistent"
            severity={accessDenied ? 'warning' : 'error'}
            action={
              !accessDenied ? (
                <Button color="inherit" onClick={() => query.refetch()}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            {accessDenied
              ? 'You do not have access to these student records.'
              : 'Student records could not be loaded. Your filters have been kept.'}
          </StudentFeedback>
        ) : undefined
      }
      isFilter={false}
      serverSidePagination
      serverSideSearch
      serverSideSort
      serverSideFilter
      filters={directoryTableFilters(columnFilters)}
      onServerFilter={(filters) =>
        update({ columnFilters: serializeDirectoryFilters(filters), page: 0 })
      }
      onClearCriteria={() => update({ columnFilters: undefined, search: undefined, page: 0 })}
      serverSideSortMode="single"
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 25, 50, 100]}
      searchTerm={search}
      sorts={
        sorting
          ? [
              {
                column: sorting.startsWith('grNumber') ? 'grNumber' : 'name',
                direction: sorting.endsWith('desc') ? 'desc' : 'asc',
              },
            ]
          : []
      }
      onServerPagination={(nextPage, rowsPerPage) =>
        update({
          page: rowsPerPage === pageSize ? Math.max(0, nextPage - 1) : 0,
          pageSize: rowsPerPage,
        })
      }
      onServerSearch={(value) => {
        if (value !== search) update({ search: value || undefined, page: 0 });
      }}
      onServerSort={(_column, sorts) =>
        update({
          sort: sorts.length ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
          page: 0,
        })
      }
      searchFieldProps={{
        placeholder: 'Search name or GR number',
        inputProps: { 'aria-label': 'Search student list' },
      }}
      noDataText={
        <Stack component="span" spacing={1} alignItems="center" sx={{ color: 'text.primary' }}>
          <Typography component="span" variant="body2">
            {hasFilters
              ? 'No students match your search or filters.'
              : page > 0
                ? 'There are no students on this page.'
                : population === 'Former'
                  ? 'No former students in this academic year.'
                  : 'No active students in this academic year.'}
          </Typography>
          {hasFilters ? (
            <Button variant="outlined" color="inherit" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : page > 0 ? (
            <Button variant="outlined" color="inherit" onClick={() => update({ page: 0 })}>
              First page
            </Button>
          ) : population === 'Former' ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => update({ population: undefined, page: 0 })}
            >
              Show active students
            </Button>
          ) : null}
        </Stack>
      }
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Student List' }}
    />
  );
}
