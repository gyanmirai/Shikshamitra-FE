'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import {
  useGetStudentBirthdaysQuery,
  useGetStudentBirthdayOptionsQuery,
} from 'src/redux/student/records/student-birthdays-api';

import { directoryScope } from './student-directory-scope';
import { birthdayColumns } from './student-birthday-columns';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import StudentBirthdayPeriodFilter from './student-birthday-period-filter';
import StudentDirectoryAcademicFilters from './student-directory-academic-filters';
import {
  readBirthdayPeriod,
  formatBirthdayDate,
  birthdaySchoolClock,
  getBirthdayDateRange,
} from './student-birthday-filters';

const PAGE_SIZES = [10, 25, 50, 100];
const CLEAR_ACADEMIC_FILTERS = {
  board: undefined,
  medium: undefined,
  class: undefined,
  division: undefined,
  page: undefined,
};

function useBirthdaySchoolDay() {
  const [day, setDay] = useState(() => birthdaySchoolClock(Date.now()).schoolDate);
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      window.clearTimeout(timer);
      const clock = birthdaySchoolClock(Date.now());
      setDay(clock.schoolDate);
      timer = window.setTimeout(schedule, clock.delay);
    };
    schedule();
    window.addEventListener('focus', schedule);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', schedule);
    };
  }, []);
  return day;
}

function statusFrom(error: unknown) {
  return error && typeof error === 'object' && 'status' in error ? error.status : undefined;
}

export default function StudentBirthdays() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id) ?? '';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, studentPermissions.records.birthdays);
  const canViewProfile = hasGrantedPermission(permissions, studentPermissions.records.studentList);
  const canViewDashboard = hasGrantedPermission(permissions, studentPermissions.dashboard);
  const schoolDay = useBirthdaySchoolDay();

  const urlYear = params.get('year');
  const resetForYear = Boolean(academicYearId && urlYear && urlYear !== academicYearId);
  useEffect(() => {
    if (!academicYearId || urlYear === academicYearId) return;
    const changes = resetForYear ? CLEAR_ACADEMIC_FILTERS : {};
    router.replace(recordsQueryUrl(pathname, currentQuery, { ...changes, year: academicYearId }), {
      scroll: false,
    });
  }, [academicYearId, currentQuery, pathname, resetForYear, router, urlYear]);
  const update = (changes: Record<string, string | number | undefined>) => {
    const next = recordsQueryUrl(pathname, currentQuery, { ...changes, year: academicYearId });
    if (next !== (currentQuery ? `${pathname}?${currentQuery}` : pathname)) {
      router.push(next, { scroll: false });
    }
  };

  const period = readBirthdayPeriod(params.get('period'));
  const rawStart = params.get('startDate') ?? '';
  const rawEnd = params.get('endDate') ?? '';
  const customRange = getBirthdayDateRange(rawStart, rawEnd);
  const isCustom = period === 'custom';
  const needsCustomRange =
    isCustom && (!customRange.dates[0] || !customRange.dates[1] || !!customRange.error);
  const search = (params.get('search') ?? '').slice(0, 150);
  const page = positivePageValue(params.get('page'), 0, 100000);
  const requestedPageSize = positivePageValue(params.get('pageSize'), 25, 100);
  const pageSize = PAGE_SIZES.includes(requestedPageSize) ? requestedPageSize : 25;

  const options = useGetStudentBirthdayOptionsQuery(
    { academicYearId },
    { skip: !canView || !academicYearId, refetchOnFocus: true, refetchOnMountOrArgChange: true }
  );
  const visibleOptions = options.isError ? undefined : options.currentData;
  const scope = directoryScope(
    new URLSearchParams(resetForYear ? '' : currentQuery),
    visibleOptions
  );
  const ready =
    canView && Boolean(academicYearId) && scope.ready && !resetForYear && !needsCustomRange;
  const query = useGetStudentBirthdaysQuery(
    {
      academicYearId,
      boardId: scope.board || undefined,
      mediumId: scope.medium || undefined,
      standardId: scope.classes[0],
      divisionId: scope.divisions[0],
      period,
      startDate: isCustom ? rawStart : undefined,
      endDate: isCustom ? rawEnd : undefined,
      search: search.trim() || undefined,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      schoolDayKey: isCustom ? undefined : schoolDay,
    },
    { skip: !ready, refetchOnFocus: true, refetchOnMountOrArgChange: true }
  );
  const roster = ready && !query.isError ? query.currentData : undefined;
  const displayPage = roster
    ? Math.min(page, Math.max(0, Math.ceil(roster.totalCount / pageSize) - 1))
    : 0;
  const clampingPage = Boolean(roster && !query.isFetching && displayPage !== page);
  useEffect(() => {
    if (!clampingPage) return;
    router.replace(recordsQueryUrl(pathname, currentQuery, { page: displayPage || undefined }), {
      scroll: false,
    });
  }, [clampingPage, currentQuery, displayPage, pathname, router]);
  const rows = useMemo(
    () =>
      roster?.items.map((row) => ({
        ...row,
        id: `${row.studentId}:${row.occurrenceDate}`,
      })) ?? [],
    [roster]
  );
  const columns = useMemo(() => birthdayColumns(canViewProfile), [canViewProfile]);
  const scopeSelected = !!(params.get('class') || params.get('division'));
  const bootingOptions =
    Boolean(canView && academicYearId) && !options.currentData && !options.isError;

  const restricted =
    !canView || statusFrom(options.error) === 403 || statusFrom(query.error) === 403;
  const retry = options.isError ? options.refetch : query.refetch;
  let feedback: ReactNode;
  if (restricted) {
    feedback = <Typography role="status">You do not have access to student birthdays.</Typography>;
  } else if (!academicYearId) {
    feedback = <Typography role="status">Select an academic year in the header.</Typography>;
  } else if (statusFrom(query.error) === 400) {
    feedback = (
      <StudentFeedback
        notificationKey="birthday-filters-invalid"
        presentation="inline"
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() =>
              update({
                ...CLEAR_ACADEMIC_FILTERS,
                period: undefined,
                startDate: undefined,
                endDate: undefined,
              })
            }
          >
            Reset filters
          </Button>
        }
      >
        The selected dates or academic filters are unavailable.
      </StudentFeedback>
    );
  } else if (options.isError || query.isError) {
    feedback = (
      <StudentFeedback
        notificationKey={options.isError ? 'birthday-filters-error' : 'birthday-list-error'}
        presentation="toast"
        severity="error"
        toastAction={
          <Button color="inherit" size="small" onClick={() => retry()}>
            Retry
          </Button>
        }
      >
        {options.isError
          ? 'Academic filters could not be loaded.'
          : 'Birthdays could not be loaded.'}
      </StudentFeedback>
    );
  } else if (visibleOptions && !scope.board) {
    feedback = (
      <Typography role="status">You have no assigned academic scope for this year.</Typography>
    );
  } else if (visibleOptions && !scope.ready && !resetForYear) {
    feedback = (
      <Stack alignItems="center" spacing={1}>
        <Typography role="status">The selected academic filters are unavailable.</Typography>
        <Button size="small" variant="outlined" onClick={() => update(CLEAR_ACADEMIC_FILTERS)}>
          Reset filters
        </Button>
      </Stack>
    );
  } else if (needsCustomRange && scope.ready) {
    feedback = <Typography role="status">Choose a valid date range to view birthdays.</Typography>;
  }

  const rangeLabel =
    roster?.startDate === roster?.endDate
      ? formatBirthdayDate(roster?.startDate, 'ddd, DD MMM YYYY')
      : [roster?.startDate, roster?.endDate]
          .map((date) => formatBirthdayDate(date, 'DD MMM YYYY'))
          .join(' – ');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Birthday"
        description="Find birthdays in your academic scope. Today follows Indian Standard Time."
        links={[
          { name: 'Student', href: canViewDashboard ? studentPaths.dashboard : undefined },
          ...(canViewProfile
            ? [{ name: 'Student Records', href: studentPaths.records.studentList }]
            : [{ name: 'Student Records' }]),
          { name: 'Birthday' },
        ]}
      />
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <StudentDirectoryAcademicFilters
          scope={scope}
          options={visibleOptions}
          isLoading={bootingOptions || resetForYear}
          disabled={
            !canView || !academicYearId || options.isError || bootingOptions || resetForYear
          }
          onChange={(changes) => update({ ...changes, page: undefined })}
        />
      </Paper>
      <StudentBirthdayPeriodFilter
        period={period}
        dates={customRange.dates}
        error={customRange.error}
        schoolDate={roster?.schoolDate ?? schoolDay}
        rangeLabel={roster ? rangeLabel : undefined}
        disabled={restricted || !academicYearId}
        onPeriodChange={(value) =>
          update({ period: value === 'today' ? undefined : value, page: undefined })
        }
        onDateChange={([start, end]) =>
          update({
            startDate: start?.isValid() ? start.format('YYYY-MM-DD') : undefined,
            endDate: end?.isValid() ? end.format('YYYY-MM-DD') : undefined,
            page: undefined,
          })
        }
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: { xs: 360, md: 0 },
          minWidth: 0,
        }}
      >
        <CustomizableTable
          tableId="student-birthdays"
          tableTitle="Student birthdays"
          columns={columns}
          data={rows}
          isSearch
          serverSideSearch
          searchTerm={search}
          searchFieldProps={{
            placeholder: 'Search student name',
            disabled: Boolean(feedback),
            inputProps: { 'aria-label': 'Search student name', maxLength: 150 },
          }}
          onServerSearch={(value) => {
            if (value !== search) update({ search: value || undefined, page: undefined });
          }}
          onClearCriteria={() => update({ ...CLEAR_ACADEMIC_FILTERS, search: undefined })}
          isFilter={false}
          showColumns={false}
          showExport={false}
          showFullScreen={false}
          isPagination
          serverSidePagination
          paginationDisabled={!roster || clampingPage}
          isShowedDense
          page={displayPage}
          rowsPerPage={pageSize}
          rowsPerPageOptions={PAGE_SIZES}
          totalCount={roster?.totalCount ?? 0}
          onServerPagination={(nextPage, nextSize) =>
            update({
              page: nextSize === pageSize ? Math.max(0, nextPage - 1) : undefined,
              pageSize: nextSize,
            })
          }
          externalFiltersActive={scopeSelected}
          isLoading={
            bootingOptions || resetForYear || clampingPage || (ready && !roster && query.isFetching)
          }
          isRefreshing={Boolean(roster && query.isFetching)}
          errorContent={feedback}
          noDataText={
            page > 0 ? (
              <Stack alignItems="center" spacing={1}>
                <Typography>There are no birthdays on this page.</Typography>
                <Button size="small" variant="outlined" onClick={() => update({ page: undefined })}>
                  First page
                </Button>
              </Stack>
            ) : (
              'No birthdays in the selected period.'
            )
          }
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Student birthdays' }}
        />
      </Box>
    </Box>
  );
}
