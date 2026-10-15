'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryInput } from 'src/redux/student/records/student-records-types';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Stack, Paper, Alert, Button, LinearProgress } from '@mui/material';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';

import LegacyRecordEntry from './legacy-record-entry';
import StudentDirectoryTable from './student-directory-table';
import StudentDirectoryFilters from './student-directory-filters';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import StudentDirectoryFilterFields from './student-directory-filter-fields';

import type { DirectoryRowActions } from './student-directory-columns';

type Props = { rowActions?: DirectoryRowActions };

export default function StudentDirectory({ rowActions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const legacyOpen = useBoolean();
  const canUseLegacy = hasGrantedPermission(permissions, [
    'Students.Records.Overrides.Request',
    'Students.Records.Overrides.Approve',
  ]);
  const population = params.get('population') === 'Former' ? 'Former' : 'Active';
  const year =
    params.get('dashboard') === 'directory'
      ? params.get('year') || currentYear?.id || ''
      : (currentYear?.id ?? '');
  const boardId = params.get('board') ?? '';
  const mediumId = params.get('medium') ?? '';
  const standardId = params.get('class') ?? '';
  const divisionId = params.get('division') ?? '';
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const sorting = params.get('sort') ?? '';
  const update = useCallback(
    (values: Record<string, string | number | undefined>) => {
      const url = recordsQueryUrl(pathname, currentQuery, {
        ...values,
        year: params.get('dashboard') === 'directory' ? year : undefined,
      });
      if (url !== `${pathname}${currentQuery ? `?${currentQuery}` : ''}`) {
        router.push(url, { scroll: false });
      }
    },
    [currentQuery, pathname, router, params, year]
  );
  const input: StudentDirectoryInput = {
    population,
    academicYearId: year || undefined,
    boardId: boardId || undefined,
    mediumId: mediumId || undefined,
    standardId: standardId || undefined,
    divisionId: divisionId || undefined,
    search,
    sorting: sorting || undefined,
    skipCount: page * pageSize,
    maxResultCount: pageSize,
  };
  const query = useGetStudentRecordsDirectoryQuery(input, { skip: !year });
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: year },
    { skip: !year }
  );
  const clearScope = () =>
    update({
      board: undefined,
      medium: undefined,
      class: undefined,
      division: undefined,
      search: undefined,
      page: 0,
    });
  const profileHref = useCallback(
    (studentId: string) =>
      recordsQueryUrl(studentPaths.records.studentList, currentQuery, {
        student: studentId,
        view: undefined,
        section: undefined,
        tab: undefined,
        year: undefined,
      }),
    [currentQuery]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Student List"
        description="Find active and former students and open their permanent profile."
        descriptionDisplay="tooltip"
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Student List' },
        ]}
        action={
          canUseLegacy ? (
            <Button variant="outlined" color="inherit" onClick={legacyOpen.onTrue}>
              Historical entry
            </Button>
          ) : undefined
        }
      />
      {options.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => options.refetch()}>
              Retry filters
            </Button>
          }
        >
          Academic filter choices could not be loaded. The current view is preserved.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <StudentDirectoryFilterFields
            values={{ board: boardId, medium: mediumId, class: standardId, division: divisionId }}
            options={options.currentData}
            isLoading={options.isLoading || (options.isFetching && !options.currentData)}
            disabled={!year || options.isError}
            onChange={(changes) => update({ ...changes, page: 0 })}
          />
          <StudentDirectoryFilters
            population={population}
            onApply={(value) =>
              update({ population: value === 'Active' ? undefined : value, page: 0 })
            }
          />
        </Stack>
      </Paper>
      {query.isFetching && !query.isLoading && (
        <LinearProgress aria-label="Refreshing student list" />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <StudentDirectoryTable
          {...{ query, page, pageSize, search, sorting, update }}
          population={population}
          academicYearReady={Boolean(year)}
          profileHref={profileHref}
          rowActions={rowActions}
          onClearFilters={clearScope}
          hasFilters={Boolean(boardId || mediumId || standardId || divisionId || search)}
        />
      </Box>
      {legacyOpen.value && <LegacyRecordEntry open onClose={legacyOpen.onFalse} />}
    </Box>
  );
}
