'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { useGetYearByIdQuery } from 'src/redux/year/yearApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { toDateOnly, formatDateOnly } from 'src/utils/date-only';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StudentDirectoryFilterFields from 'src/screens/student/records/student-directory-filter-fields';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Button,
  Tooltip,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useDailyAttendance } from './use-daily-attendance';
import AttendanceRegisterQueue from './attendance-register-queue';

const links = [
  { name: 'Student', href: studentPaths.dashboard },
  { name: 'Attendance', href: studentPaths.attendance.root },
  { name: 'Daily Attendance' },
];

function DailyAttendanceWorkspace({
  academicYearOverride,
}: {
  academicYearOverride?: AcademicYear;
}) {
  const v = useDailyAttendance(academicYearOverride);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: 1 },
        minHeight: 0,
        minWidth: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Daily Attendance"
        description="Review students by academic scope and record their daily attendance."
        descriptionDisplay="tooltip"
        links={links}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="outlined"
              disabled={!v.canSave}
              loading={v.saving && !v.retryPayload?.submit}
              onClick={() => v.save(false)}
            >
              Save draft
            </Button>
            <Tooltip title={v.submitReason}>
              <span>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!v.canSubmit}
                  loading={v.saving && !!v.retryPayload?.submit}
                  onClick={() => v.setDecision('submit')}
                >
                  Submit attendance
                </Button>
              </span>
            </Tooltip>
            {v.canManageLock && (
              <Tooltip
                title={
                  v.snapshot?.isSubmitted
                    ? 'Lock the reviewed attendance register.'
                    : 'Submit attendance before locking.'
                }
              >
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:lock-outline" width={16} />}
                    disabled={!v.canLock}
                    loading={v.locking}
                    onClick={() => v.setDecision('lock')}
                  >
                    Lock attendance
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        }
      />
      {v.contextChanged && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" disabled={v.busy} onClick={v.switchContext}>
              Switch context
            </Button>
          }
        >
          Save or discard your changes before switching the academic context.
        </Alert>
      )}
      {!v.classRegister && v.context && v.validSelection && (
        <Typography variant="body2" color="text.secondary">
          Choose a class and division to mark, submit or lock attendance.
        </Typography>
      )}
      {v.classRegister && v.snapshot && !v.editable && !v.busy && !v.stale && !v.blockingError && (
        <Alert severity="info">
          {v.snapshot.isLocked
            ? 'This attendance register is locked.'
            : 'This register is read-only. Your permission, teacher assignment or school policy does not allow marking here.'}
        </Alert>
      )}
      {v.classRegister && v.snapshot && !v.snapshot.isExpected && (
        <Alert severity="info">
          {v.snapshot.notExpectedReason || 'Attendance is not expected on this date.'}
        </Alert>
      )}
      {v.snapshot?.needsReview && (
        <Alert severity="warning">Roster changed after submission. Review and submit again.</Alert>
      )}
      {v.needsCreditCorrection && (
        <Alert severity="warning">
          Approved leave changed after submission. Attendance credit corrections require review
          under school policy.
        </Alert>
      )}
      {v.snapshot?.isExpected && !v.snapshot.isSubmitted && v.snapshot.isPastMarkingCutoff && (
        <Alert severity="warning">
          The school marking cutoff has passed. Review and submit the attendance register.
        </Alert>
      )}
      {v.stale && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={v.refresh} disabled={v.busy}>
              Review latest
            </Button>
          }
        >
          The register or student roster changed after this draft was loaded. Review the latest
          version before saving.
        </Alert>
      )}
      {v.failure && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={v.refresh} disabled={v.busy}>
              Review latest
            </Button>
          }
        >
          {v.failure}
        </Alert>
      )}
      {v.reasonRequired && (
        <TextField
          size="small"
          label="Correction reason"
          value={v.correctionReason}
          disabled={v.busy}
          onChange={(event) => v.changeReason(event.target.value)}
          helperText={
            v.leaveConflict
              ? 'Explain why the student was present during approved leave.'
              : 'Required when changing submitted attendance; retained in the attendance history.'
          }
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />
      )}
      {v.classRegister && (
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:checkmark-fill" width={16} />}
            disabled={!v.editable || !v.pendingForBulk}
            onClick={v.bulkPresent}
          >
            Mark pending as Present
          </Button>
        </Stack>
      )}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <DatePicker
            label="Date"
            value={v.selection.date ? dayjs(v.selection.date) : null}
            format="DD-MM-YYYY"
            disabled={!v.context || v.busy}
            minDate={v.year?.startDate ? dayjs(v.year.startDate) : undefined}
            maxDate={
              v.schoolToday
                ? dayjs(
                    v.year?.endDate && toDateOnly(v.year.endDate) < v.schoolToday
                      ? toDateOnly(v.year.endDate)
                      : v.schoolToday
                  )
                : undefined
            }
            onChange={(value: Dayjs | null) => {
              if (value?.isValid()) v.changeSelection({ date: toDateOnly(value) });
            }}
            slotProps={{
              textField: { size: 'small', sx: { width: { xs: 1, lg: 170 }, flexShrink: 0 } },
            }}
          />
          <StudentDirectoryFilterFields
            values={{
              board: v.selection.board,
              medium: v.selection.medium,
              class: v.selection.standard,
              division: v.selection.division,
            }}
            options={v.options}
            isLoading={v.contextQuery.isLoading || (v.contextQuery.isFetching && !v.context)}
            disabled={!v.context || v.busy}
            onChange={(changes) =>
              v.changeSelection({
                ...(changes.board !== undefined ? { board: changes.board } : {}),
                ...(changes.medium !== undefined ? { medium: changes.medium } : {}),
                ...(changes.class !== undefined ? { standard: changes.class } : {}),
                ...(changes.division !== undefined ? { division: changes.division } : {}),
              })
            }
          />
        </Stack>
      </Paper>
      {v.schoolToday && v.selection.date > v.schoolToday && (
        <Alert severity="warning">Attendance cannot be taken for a future date.</Alert>
      )}
      {(v.contextQuery.isFetching || (v.validSelection && v.activeQuery.isFetching)) && (
        <LinearProgress aria-label="Refreshing attendance" />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          // DESIGN.md permits a practical mobile minimum while the surrounding page scrolls.
          minHeight: { xs: 360, md: 0 },
          overflow: 'hidden',
        }}
      >
        <CustomizableTable
          tableId="student-daily-attendance-aligned"
          tableTitle="Daily attendance students"
          columns={v.columns}
          data={v.classRegister ? v.classTable.rows : v.tableRows}
          totalCount={
            v.classRegister
              ? v.classTable.total
              : v.validSelection && !v.blockingError
                ? v.workspaceQuery.currentData?.totalCount || 0
                : 0
          }
          isLoading={
            !!v.year &&
            (v.contextQuery.isLoading ||
              (v.contextQuery.isFetching && !v.context) ||
              (v.validSelection &&
                (v.activeQuery.isLoading ||
                  (v.activeQuery.isFetching && !v.activeQuery.currentData))))
          }
          errorContent={
            v.blockingError ? (
              <Alert
                severity={v.denied ? 'warning' : 'error'}
                action={
                  !v.denied ? (
                    <Button
                      color="inherit"
                      onClick={() => {
                        if (v.contextQuery.isError) v.contextQuery.refetch();
                        else v.refresh();
                      }}
                    >
                      Retry
                    </Button>
                  ) : undefined
                }
              >
                {v.denied
                  ? 'You do not have access to this attendance scope.'
                  : `Attendance could not be loaded. ${v.loadError} Your filters and unsaved marks are retained.`}
              </Alert>
            ) : undefined
          }
          isSearch
          isPagination
          isFilter={false}
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          page={v.tableQuery.page}
          rowsPerPage={v.tableQuery.rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          searchTerm={v.tableQuery.searchTerm}
          sorts={
            v.classRegister
              ? v.tableQuery.sorts
              : v.tableQuery.sorts.filter((sort) => sort.column !== 'rollNo')
          }
          onServerPagination={(page, size) =>
            v.updateUrl({ page: Math.max(0, page - 1), pageSize: size, size: undefined })
          }
          onServerSearch={(search) => {
            if (search !== v.tableQuery.searchTerm)
              v.updateUrl({ search: search || undefined, page: 0 });
          }}
          onServerSort={(_column, sorts) =>
            v.updateUrl({
              sort: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
              sorts: undefined,
              page: 0,
            })
          }
          searchFieldProps={{
            placeholder: 'Search students by name, roll no. or GR no.',
            inputProps: { 'aria-label': 'Search daily attendance', maxLength: 150 },
          }}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'Daily attendance students' }}
          noDataText={
            <Stack alignItems="center" spacing={1}>
              <Typography variant="body2">{v.emptyMessage}</Typography>
              {v.hasFilters && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={v.clearFilters}
                  disabled={v.busy}
                >
                  Clear filters
                </Button>
              )}
              {v.tableQuery.page > 0 && (
                <Button variant="outlined" color="inherit" onClick={() => v.updateUrl({ page: 0 })}>
                  First page
                </Button>
              )}
            </Stack>
          }
        />
      </Box>
      <ConfirmDialog
        open={v.decision !== null}
        icon="info"
        title={v.decision === 'lock' ? 'Lock Attendance?' : 'Submit Attendance?'}
        disableBackdropClick
        disableCancel={v.busy}
        disableEscapeKeyDown={v.busy}
        onClose={() => {
          if (!v.busy) v.setDecision(null);
        }}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              {v.decision === 'lock'
                ? `Lock the submitted register for ${formatDateOnly(v.selection.date)}? Further changes follow the school's correction policy.`
                : `Submit attendance for ${formatDateOnly(v.selection.date)}? All ${v.counts.expected} expected students in this class have been marked.`}
            </Typography>
            {v.failure && <Alert severity="error">{v.failure}</Alert>}
          </Stack>
        }
        action={
          <Button
            variant="contained"
            loading={v.busy}
            disabled={v.busy || !(v.decision === 'lock' ? v.canLock : v.canSubmit)}
            onClick={() => (v.decision === 'lock' ? v.lockSubmitted() : v.save(true))}
          >
            {v.decision === 'lock' ? 'Lock attendance' : 'Submit attendance'}
          </Button>
        }
      />
      {v.confirmation}
    </Box>
  );
}

function AttendanceWorkspaceRoute() {
  const params = useSearchParams();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const queue = params.get('dashboard') === 'pending-registers';
  const requestedYear = params.get('year');
  const [linkedYear, setLinkedYear] = useState<AcademicYear | undefined>(() =>
    currentYear?.id === requestedYear ? currentYear : undefined
  );
  const cachedYear = linkedYear?.id === requestedYear ? linkedYear : undefined;
  const globalYear = currentYear?.id === requestedYear ? currentYear : undefined;
  const resolveYear = !queue && Boolean(requestedYear && !cachedYear && !globalYear);
  const year = useGetYearByIdQuery(requestedYear || '', { skip: !resolveYear });
  const effectiveYear =
    cachedYear ||
    globalYear ||
    (!year.isError && year.currentData?.id === requestedYear
      ? (year.currentData as AcademicYear)
      : undefined);
  useEffect(() => {
    if (effectiveYear && effectiveYear.id !== linkedYear?.id) setLinkedYear(effectiveYear);
  }, [effectiveYear, linkedYear?.id]);
  if (!queue && requestedYear && !effectiveYear) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <CustomBreadcrumbs
          heading="Daily Attendance"
          description="Review students and record daily attendance."
          links={links}
        />
        {year.isError ? (
          <Alert severity="error" action={<Button onClick={() => year.refetch()}>Retry</Button>}>
            The academic year for this register could not be loaded.
          </Alert>
        ) : (
          <LinearProgress aria-label="Loading register academic year" />
        )}
      </Box>
    );
  }
  return queue ? (
    <AttendanceRegisterQueue />
  ) : (
    <DailyAttendanceWorkspace academicYearOverride={requestedYear ? effectiveYear : undefined} />
  );
}

export default function TakeAttendanceScreen() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
          <CustomBreadcrumbs
            heading="Daily Attendance"
            description="Review students and record daily attendance."
            descriptionDisplay="tooltip"
            links={links}
          />
          <LinearProgress aria-label="Loading daily attendance" />
        </Box>
      }
    >
      <AttendanceWorkspaceRoute />
    </Suspense>
  );
}
