import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import { useMemo } from 'react';
import { useResponsive } from 'src/hooks/use-responsive';
import { Stack, Alert, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { directoryStudentName, buildDirectoryColumns } from './student-directory-columns';

import type { DirectoryRowActions } from './student-directory-columns';
import type { StudentPopulation } from './student-directory-filter-panel';

type Props = {
  hasFilters: boolean;
  query: ReturnType<typeof useGetStudentRecordsDirectoryQuery>;
  page: number;
  pageSize: number;
  search: string;
  sorting: string;
  update: (values: Record<string, string | number | undefined>) => void;
  population: StudentPopulation;
  academicYearReady: boolean;
  profileHref: (studentId: string) => string;
  rowActions?: DirectoryRowActions;
  onClearFilters: () => void;
};
export default function StudentDirectoryTable({
  hasFilters,
  query,
  page,
  pageSize,
  search,
  sorting,
  update,
  population,
  academicYearReady,
  profileHref,
  rowActions,
  onClearFilters,
}: Props) {
  const compact = useResponsive('down', 'sm');
  const columns = useMemo(
    () => buildDirectoryColumns({ profileHref, rowActions, compact }),
    [profileHref, rowActions, compact]
  );
  const rows = useMemo(
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

  return (
    <CustomizableTable
      tableId="student-records-directory"
      tableTitle="Student List"
      columns={columns}
      data={rows}
      totalCount={academicYearReady && !query.isError ? (query.currentData?.totalCount ?? 0) : 0}
      isLoading={academicYearReady && (query.isLoading || (query.isFetching && !query.currentData))}
      errorContent={
        !academicYearReady ? (
          <Alert severity="info">Select an academic year to view students.</Alert>
        ) : query.isError ? (
          <Alert
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
          </Alert>
        ) : undefined
      }
      isFilter={false}
      serverSidePagination
      serverSideSearch
      serverSideSort
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
        update({ page: rowsPerPage === pageSize ? nextPage : 0, pageSize: rowsPerPage })
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
