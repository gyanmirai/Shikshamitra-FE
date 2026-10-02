'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StudentDirectoryItem,
  StudentDirectoryInput,
} from 'src/redux/student/records/student-records-types';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Stack, Paper, Alert, Button, Typography, LinearProgress } from '@mui/material';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';

import LegacyRecordEntry from './legacy-record-entry';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

const nameOf = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Restricted identity';

export default function StudentDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const canUseLegacy = hasGrantedPermission(permissions, [
    'Students.Records.Overrides.Request',
    'Students.Records.Overrides.Approve',
  ]);
  const population = params.get('population') === 'Former' ? 'Former' : 'Active';
  const year = params.get('year') ?? currentYear?.id ?? '';
  const scopeOptions = useGetStudentRecordsDirectoryOptionsQuery({
    academicYearId: year === 'all' ? undefined : year || undefined,
  });
  const boards = scopeOptions.currentData?.boards ?? [];
  const boardId = params.get('board') ?? '';
  const mediumId = params.get('medium') ?? '';
  const standardId = params.get('class') ?? '';
  const divisionId = params.get('division') ?? '';
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const sorting = params.get('sort') ?? 'name asc';
  const update = (values: Record<string, string | number | undefined>) =>
    router.push(recordsQueryUrl(pathname, params.toString(), values), { scroll: false });
  const mediums = (scopeOptions.currentData?.mediums ?? []).filter(
    (medium) => !boardId || medium.parentId === boardId
  );
  const classes = (scopeOptions.currentData?.standards ?? [])
    .filter((standard) => !mediumId || standard.parentId === mediumId)
    .filter((standard) => !boardId || mediums.some((medium) => medium.id === standard.parentId));
  const divisions = (scopeOptions.currentData?.divisions ?? [])
    .filter((division) => !standardId || division.parentId === standardId)
    .filter(
      (division) =>
        (!mediumId && !boardId) || classes.some((standard) => standard.id === division.parentId)
    );
  const input: StudentDirectoryInput = {
    population,
    academicYearId: year === 'all' ? undefined : year || undefined,
    boardId: boardId || undefined,
    mediumId: mediumId || undefined,
    standardId: standardId || undefined,
    divisionId: divisionId || undefined,
    search,
    sorting,
    skipCount: page * pageSize,
    maxResultCount: pageSize,
  };
  const query = useGetStudentRecordsDirectoryQuery(input);
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Student',
        minWidth: 200,
        isSort: true,
        render: (_value, row) => (
          <Button
            component={RouterLink}
            href={`${studentPaths.records.studentList}?student=${encodeURIComponent(row.studentId)}`}
            color="inherit"
            sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            {nameOf(row as StudentDirectoryItem)}
          </Button>
        ),
      },
      {
        id: 'grNumber',
        label: 'GR number',
        minWidth: 120,
        isSort: true,
        render: (value, row) => value || row.grNo || '—',
      },
      { id: 'standardName', label: 'Class', minWidth: 110 },
      { id: 'divisionName', label: 'Division', minWidth: 110 },
      { id: 'rollNo', label: 'Roll number', minWidth: 100, render: (value) => value ?? '—' },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        render: (value) => (
          <Label color={value === 'Enrolled' || value === 6 ? 'success' : 'default'}>
            {typeof value === 'number'
              ? ({ 6: 'Active', 7: 'Inactive', 8: 'Left' }[value] ?? 'Unknown')
              : value}
          </Label>
        ),
      },
      {
        id: 'entrySource',
        label: 'Record entry',
        minWidth: 150,
        render: (value) =>
          value === 'LegacyOverride' ? 'Approved historical entry' : 'Onboarding completed',
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 115,
        sticky: true,
        stickyPosition: 'right',
        excludeFromExport: true,
        render: (_value, row) => (
          <Button
            component={RouterLink}
            href={`${studentPaths.records.studentList}?student=${encodeURIComponent(row.studentId)}`}
            aria-label={`Open profile for ${nameOf(row as StudentDirectoryItem)}`}
          >
            Open profile
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Student Directory"
        description="Find active and former students and open their permanent profile."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Student Directory' },
        ]}
        action={
          canUseLegacy ? (
            <Button onClick={() => setLegacyOpen(true)}>Historical entry</Button>
          ) : undefined
        }
      />
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <CustomSelect
            label="Students"
            value={population}
            options={[
              { value: 'Active', label: 'Active students' },
              { value: 'Former', label: 'Former students' },
            ]}
            onChange={(value) => update({ population: String(value), page: 0 })}
          />
          <CustomSelect
            label="Academic year"
            value={year || 'all'}
            options={[
              ...(scopeOptions.currentData?.academicYears ?? []).map((option) => ({
                value: option.id,
                label: option.name,
              })),
              { value: 'all', label: 'All enrollment years' },
            ]}
            onChange={(value) =>
              update({
                year: String(value),
                board: undefined,
                medium: undefined,
                class: undefined,
                division: undefined,
                page: 0,
              })
            }
            isLoading={scopeOptions.isFetching}
          />
          <Button
            onClick={() =>
              update({
                board: undefined,
                medium: undefined,
                class: undefined,
                division: undefined,
                search: undefined,
                page: 0,
                sort: undefined,
              })
            }
          >
            Clear filters
          </Button>
        </Stack>
        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          <CustomSelect
            label="Board"
            value={boardId}
            options={[{ id: '', name: 'All boards' }, ...boards]}
            labelKey="name"
            valueKey="id"
            onChange={(value) =>
              update({
                board: String(value),
                medium: undefined,
                class: undefined,
                division: undefined,
                page: 0,
              })
            }
          />
          <CustomSelect
            label="Medium"
            value={mediumId}
            options={[{ id: '', name: 'All mediums' }, ...mediums]}
            labelKey="name"
            valueKey="id"
            onChange={(value) =>
              update({ medium: String(value), class: undefined, division: undefined, page: 0 })
            }
          />
          <CustomSelect
            label="Class"
            value={standardId}
            options={[{ id: '', name: 'All classes' }, ...classes]}
            labelKey="name"
            valueKey="id"
            onChange={(value) => update({ class: String(value), division: undefined, page: 0 })}
          />
          <CustomSelect
            label="Division"
            value={divisionId}
            options={[{ id: '', name: 'All divisions' }, ...divisions]}
            labelKey="name"
            valueKey="id"
            onChange={(value) => update({ division: String(value), page: 0 })}
          />
        </Box>
      </Paper>
      {scopeOptions.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => scopeOptions.refetch()}>
              Retry filters
            </Button>
          }
        >
          Academic filter choices could not be loaded. The current view is preserved.
        </Alert>
      )}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Student records could not be loaded. Your filters have been kept.
        </Alert>
      )}
      {query.isFetching && !query.isLoading && (
        <LinearProgress aria-label="Refreshing student directory" />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-records-directory"
          tableTitle="Student Directory"
          columns={columns}
          data={query.currentData?.items ?? []}
          totalCount={query.currentData?.totalCount ?? 0}
          isLoading={query.isLoading || (query.isFetching && !query.currentData)}
          isFilter={false}
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          searchTerm={search}
          sorts={[
            {
              column: sorting.startsWith('grNumber') ? 'grNumber' : 'name',
              direction: sorting.endsWith('desc') ? 'desc' : 'asc',
            },
          ]}
          onServerPagination={(nextPage, rowsPerPage) =>
            update({ page: rowsPerPage === pageSize ? nextPage : 0, pageSize: rowsPerPage })
          }
          onServerSearch={(value) => {
            if (value !== search) update({ search: value || undefined, page: 0 });
          }}
          onServerSort={(_column, sorts) =>
            update({
              sort: sorts.length ? `${sorts[0].column} ${sorts[0].direction}` : 'name asc',
              page: 0,
            })
          }
          searchFieldProps={{
            placeholder: 'Search name or GR number',
            inputProps: { 'aria-label': 'Search student directory' },
          }}
          noDataText={
            <Typography variant="body2">
              {query.isError
                ? 'Retry to load students.'
                : 'No students match this view. Clear filters or review onboarding completion.'}
            </Typography>
          }
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Student Directory' }}
        />
      </Box>
      {legacyOpen && <LegacyRecordEntry open onClose={() => setLegacyOpen(false)} />}
    </Box>
  );
}
