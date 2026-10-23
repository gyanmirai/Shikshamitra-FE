'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryInput } from 'src/redux/student/records/student-records-types';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Chip, Stack, Paper, Button, LinearProgress } from '@mui/material';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';

import LegacyRecordEntry from './legacy-record-entry';
import StudentDirectoryTable from './student-directory-table';
import StudentDirectoryFilters from './student-directory-filters';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import { directoryColumnFilters } from './student-directory-column-filters';
import StudentDirectoryFilterFields from './student-directory-filter-fields';
import StudentRollNumberWorkspace from '../onboarding/student-setup/student-roll-number-workspace';

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
  const rollOpen = useBoolean();
  const canUseLegacy = hasGrantedPermission(permissions, 'Students.Records.Overrides.View');
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
  const columnFilters = directoryColumnFilters(params.get('columnFilters'));
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
    columnFilters: columnFilters.length ? columnFilters : undefined,
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
      columnFilters: undefined,
      page: 0,
    });
  const academicFilters = [
    {
      key: 'board',
      label: 'Board',
      value: boardId,
      choices: options.currentData?.boards,
      reset: { board: undefined, medium: undefined, class: undefined, division: undefined },
    },
    {
      key: 'medium',
      label: 'Medium',
      value: mediumId,
      choices: options.currentData?.mediums,
      reset: { medium: undefined, class: undefined, division: undefined },
    },
    {
      key: 'class',
      label: 'Class',
      value: standardId,
      choices: options.currentData?.standards,
      reset: { class: undefined, division: undefined },
    },
    {
      key: 'division',
      label: 'Division',
      value: divisionId,
      choices: options.currentData?.divisions,
      reset: { division: undefined },
    },
  ].filter((filter) => filter.value);
  const rollHelp = !year
    ? 'Select an academic year first'
    : options.isError
      ? 'Reload academic filter choices to manage roll numbers'
      : !standardId || !divisionId
        ? 'Choose one Class and one Division first'
        : 'Review division roll numbering and approval batches';
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
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-end"
          >
            {population === 'Active' && (
              <CustomTooltip title={rollHelp} arrow>
                <Box
                  component="span"
                  tabIndex={!year || !standardId || !divisionId || options.isError ? 0 : undefined}
                  aria-label={rollHelp}
                  sx={{ display: 'inline-flex' }}
                >
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={!year || !standardId || !divisionId || options.isError}
                    startIcon={<Iconify icon="mdi:format-list-numbered" width={16} />}
                    onClick={rollOpen.onTrue}
                  >
                    Manage Roll Numbers
                  </Button>
                </Box>
              </CustomTooltip>
            )}
            {canUseLegacy && (
              <Button
                type="button"
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.addIcon} width={16} />}
                onClick={legacyOpen.onTrue}
              >
                Historical entry
              </Button>
            )}
          </Stack>
        }
      />
      {options.isError && (
        <StudentFeedback
          notificationKey="STU-0853"
          presentation="toast"
          severity="error"
          sx={{ mb: 1 }}
          action={
            <Button color="inherit" onClick={() => options.refetch()}>
              Retry filters
            </Button>
          }
        >
          Academic filter choices could not be loaded. The current view is preserved.
        </StudentFeedback>
      )}
      <Paper variant="outlined" sx={{ p: 1, mb: 1, borderRadius: 2, flexShrink: 0 }}>
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
        {academicFilters.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            aria-label="Applied academic filters"
            sx={{ pt: 1 }}
          >
            {academicFilters.map((filter) => (
              <Chip
                key={filter.key}
                size="small"
                variant="outlined"
                label={`${filter.label}: ${filter.choices?.find((choice) => choice.id === filter.value)?.name ?? 'Selected'}`}
                onDelete={() => update({ ...filter.reset, page: 0 })}
              />
            ))}
            <Button
              size="small"
              color="inherit"
              onClick={() =>
                update({
                  board: undefined,
                  medium: undefined,
                  class: undefined,
                  division: undefined,
                  page: 0,
                })
              }
              startIcon={<Iconify icon={GlobalIcons.resetFilter} width={16} />}
            >
              Reset academic filters
            </Button>
          </Stack>
        )}
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        {query.isFetching && !query.isLoading && (
          <LinearProgress
            aria-label="Refreshing student list"
            sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
          />
        )}
        <StudentDirectoryTable
          {...{ query, page, pageSize, search, sorting, update, columnFilters }}
          population={population}
          academicYearReady={Boolean(year)}
          profileHref={profileHref}
          rowActions={rowActions}
          onClearFilters={clearScope}
          hasFilters={Boolean(
            boardId || mediumId || standardId || divisionId || search || columnFilters.length
          )}
        />
      </Box>
      {legacyOpen.value && <LegacyRecordEntry open onClose={legacyOpen.onFalse} />}
      {rollOpen.value && year && standardId && divisionId && (
        <StudentRollNumberWorkspace
          key={`${year}:${standardId}:${divisionId}`}
          scope={{ academicYearId: year, standardId, divisionId }}
          onClose={rollOpen.onFalse}
        />
      )}
    </Box>
  );
}
