'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryInput } from 'src/redux/student/records/student-records-types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Stack, Paper, Alert, Button, LinearProgress } from '@mui/material';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import LegacyRecordEntry from './legacy-record-entry';
import StudentDirectoryTable from './student-directory-table';
import StudentDirectoryFilters from './student-directory-filters';
import { recordsQueryUrl, positivePageValue } from './records-url-state';

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
  const year = currentYear?.id ?? '';
  const boardId = params.get('board') ?? '';
  const mediumId = params.get('medium') ?? '';
  const standardId = params.get('class') ?? '';
  const divisionId = params.get('division') ?? '';
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const sorting = params.get('sort') ?? '';
  const update = (values: Record<string, string | number | undefined>) =>
    router.push(recordsQueryUrl(pathname, params.toString(), { ...values, year: undefined }), {
      scroll: false,
    });
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
  const query = useGetStudentRecordsDirectoryQuery(input);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Student Directory"
        description="Find active and former students and open their permanent profile."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Student Directory' },
        ]}
        action={
          canUseLegacy ? (
            <Button onClick={() => setLegacyOpen(true)}>Historical entry</Button>
          ) : undefined
        }
      />
      <Paper variant="outlined" sx={{ px: 1, py: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          alignItems="center"
          sx={{ flexWrap: 'wrap', rowGap: 1 }}
        >
          <CustomSelect
            label="Students"
            value={population}
            options={[
              { value: 'Active', label: 'Active students' },
              { value: 'Former', label: 'Former students' },
            ]}
            onChange={(value) => update({ population: String(value), page: 0 })}
            formControlProps={{ sx: { width: { xs: 1, sm: 240 }, mr: 'auto' } }}
          />
          <StudentDirectoryFilters
            values={{
              board: boardId,
              medium: mediumId,
              class: standardId,
              division: divisionId,
            }}
            academicYearId={year}
            onApply={(values) => update({ ...values, page: 0 })}
          />
          {(boardId || mediumId || standardId || divisionId || search) && (
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
          )}
        </Stack>
      </Paper>
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
        <StudentDirectoryTable
          {...{ query, page, pageSize, search, sorting, update }}
          hasFilters={Boolean(boardId || mediumId || standardId || divisionId)}
        />
      </Box>
      {legacyOpen && <LegacyRecordEntry open onClose={() => setLegacyOpen(false)} />}
    </Box>
  );
}
