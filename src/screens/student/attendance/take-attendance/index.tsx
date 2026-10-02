'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Division, Standards, Organization } from 'src/types/school';
import type {
  AttendanceDay,
  AttendanceMark,
  AttendanceStudent,
} from 'src/redux/student/take-attendance/attendance-types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { toDateOnly, formatDateOnly } from 'src/utils/date-only';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useRef, useMemo, useState, Suspense, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  Stack,
  Button,
  Tooltip,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useMarkAttendanceMutation,
  useLockAttendanceMutation,
  useUnlockAttendanceMutation,
  useGetAttendanceByFilterQuery,
} from 'src/redux/student/take-attendance/take-attendace-api';

import AttendanceDetailsDialog from './attendance-details-dialog';
import AttendanceCorrectionDialog from './attendance-correction-dialog';
import { readAttendanceTableQuery } from './attendance-url-state';
import {
  getAttendanceCounts,
  hasAttendanceChanges,
  markRemainingPresent,
  attendanceStudentName,
  changeAttendanceStatus,
  normalizeAttendanceRows,
} from './attendance-draft';

type Selection = { date: string; organization: string; standard: string; division: string };
const today = () => toDateOnly(dayjs());
const DailyAttendanceWorkspace = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tableQuery = useMemo(
    () => readAttendanceTableQuery(searchParams.toString()),
    [searchParams]
  );
  const globals = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [academicContext, setAcademicContext] = useState({
    year: globals.currentYear,
    medium: globals.currentMedium,
  });
  const { year, medium } = academicContext;
  const [selection, setSelection] = useState<Selection>(() => ({
    date: searchParams.get('date') || today(),
    organization: searchParams.get('organization') || '',
    standard: searchParams.get('class') || '',
    division: searchParams.get('division') || '',
  }));
  const [snapshot, setSnapshot] = useState<AttendanceDay | null>(null);
  const [rows, setRows] = useState<AttendanceStudent[]>([]);
  const [details, setDetails] = useState<AttendanceStudent | null>(null);
  const [requestedCorrection, setRequestedCorrection] = useState<AttendanceStudent | null>(null);
  const [decision, setDecision] = useState<'submit' | 'discard' | 'lock' | null>(null);
  const [failure, setFailure] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [retryPayload, setRetryPayload] = useState<AttendanceMark | null>(null);
  const contextSeen = useRef(`${globals.currentYear?.id}/${globals.currentMedium?.id}`);
  const lastUrl = useRef(searchParams.toString());
  const lastAppliedData = useRef<AttendanceDay | undefined>(undefined);
  const dirty = snapshot ? hasAttendanceChanges(rows, snapshot.students) : false;
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, { push: router.push });
  const [mark, { isLoading: saving }] = useMarkAttendanceMutation();
  const [lock, { isLoading: locking }] = useLockAttendanceMutation();
  const [unlock, { isLoading: unlocking }] = useUnlockAttendanceMutation();
  const busy = saving || locking || unlocking;
  const clearDraft = useCallback(() => {
    lastAppliedData.current = undefined;
    setSnapshot(null);
    setRows([]);
    setFailure('');
    setRetryPayload(null);
    setCorrectionReason('');
    setDetails(null);
    setRequestedCorrection(null);
    setDecision(null);
  }, []);
  const organizations: Organization[] = medium?.educationMediumStages || [];
  const organization = organizations.find((item) => item.id === selection.organization);
  const standards: Standards[] = organization?.standards || [];
  const standard = standards.find((item) => item.id === selection.standard);
  const divisions: Division[] = standard?.divisions || [];
  const validSelection =
    !!year?.id &&
    !!divisions.find((item) => item.id === selection.division) &&
    dayjs(selection.date).isValid() &&
    (!year.startDate || selection.date >= toDateOnly(year.startDate)) &&
    (!year.endDate || selection.date <= toDateOnly(year.endDate));
  const { currentData, isLoading, isFetching, isError, error, refetch } =
    useGetAttendanceByFilterQuery(
      {
        AcademicYearId: year?.id || '',
        StandardId: selection.standard,
        DivisionId: selection.division,
        Date: selection.date,
      },
      {
        skip: !validSelection,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
      }
    );

  const replaceSelection = useCallback(
    (next: Selection) => {
      clearDraft();
      setSelection(next);
      const params = new URLSearchParams(searchParams.toString());
      Object.entries({
        date: next.date,
        organization: next.organization,
        class: next.standard,
        division: next.division,
      }).forEach(([key, value]) => (value ? params.set(key, value) : params.delete(key)));
      params.set('page', '0');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [clearDraft, pathname, router, searchParams]
  );
  const changeSelection = (patch: Partial<Selection>) =>
    requestNavigation(() => replaceSelection({ ...selection, ...patch }));

  useEffect(() => {
    if (lastUrl.current === searchParams.toString()) return;
    lastUrl.current = searchParams.toString();
    const next = {
      date: searchParams.get('date') || today(),
      organization: searchParams.get('organization') || '',
      standard: searchParams.get('class') || '',
      division: searchParams.get('division') || '',
    };
    if (
      Object.keys(next).every(
        (key) => next[key as keyof Selection] === selection[key as keyof Selection]
      )
    )
      return;
    clearDraft();
    setSelection(next);
  }, [searchParams, clearDraft, selection]);

  // A global year or medium switch must not silently discard the locally owned draft.
  useEffect(() => {
    const nextKey = `${globals.currentYear?.id}/${globals.currentMedium?.id}`;
    if (contextSeen.current === nextKey) return;
    contextSeen.current = nextKey;
    requestNavigation(() => {
      clearDraft();
      setAcademicContext({ year: globals.currentYear, medium: globals.currentMedium });
      replaceSelection({ ...selection, organization: '', standard: '', division: '' });
    });
  }, [
    globals.currentYear,
    globals.currentMedium,
    requestNavigation,
    clearDraft,
    replaceSelection,
    selection,
  ]);

  // Background refreshes may update clean state only. Revisions remain tied to the draft baseline.
  useEffect(() => {
    if (!currentData || dirty || busy || lastAppliedData.current === currentData) return;
    lastAppliedData.current = currentData;
    setSnapshot({ ...currentData, students: normalizeAttendanceRows(currentData.students) });
    setRows(normalizeAttendanceRows(currentData.students));
  }, [currentData, dirty, busy]);

  const counts = useMemo(() => getAttendanceCounts(rows), [rows]);
  const academicContextChanged =
    year?.id !== globals.currentYear?.id || medium?.id !== globals.currentMedium?.id;
  const stale =
    !!snapshot &&
    !!currentData &&
    (snapshot.revision !== currentData.revision ||
      snapshot.rosterRevision !== currentData.rosterRevision);
  const canAdd = hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.Add');
  const canManageLock = hasGrantedPermission(
    permissions,
    'Students.Attendance.MarkAttendance.Delete'
  );
  const authoritative = currentData || snapshot;
  const canRequestCorrection = hasGrantedPermission(
    permissions,
    'Students.Attendance.LeaveAndAbsent.Add'
  );
  const editable =
    !!snapshot &&
    !!authoritative?.canMark &&
    canAdd &&
    !authoritative.isLocked &&
    authoritative.isExpected &&
    !busy &&
    !stale &&
    validSelection;
  const correction = !!snapshot?.isSubmitted;
  const needsCreditCorrection = rows.some((row) => row.needsCreditCorrection);
  const leaveConflict = rows.some(
    (row) =>
      row.isExpected &&
      !row.needsCreditCorrection &&
      row.approvedLeaveId &&
      row.status === AttendanceStatus.Present
  );
  const reasonRequired =
    dirty &&
    ((correction && snapshot?.policy.sameDayCorrectionRequiresReason !== false) || leaveConflict);
  const canSave = editable && dirty && (!reasonRequired || !!correctionReason.trim());
  const canSubmit =
    editable &&
    counts.expected > 0 &&
    counts.unmarked === 0 &&
    !needsCreditCorrection &&
    (!snapshot?.isSubmitted || snapshot.needsReview || dirty) &&
    (!reasonRequired || !!correctionReason.trim());

  const updateRow = (studentId: string, change: (row: AttendanceStudent) => AttendanceStudent) => {
    if (!editable) return;
    setRetryPayload(null);
    setRows((previous) =>
      previous.map((row) =>
        row.studentId === studentId &&
        row.isExpected &&
        !row.requiresCorrectionApproval &&
        !row.needsCreditCorrection
          ? change(row)
          : row
      )
    );
  };
  const refresh = () =>
    requestNavigation(() => {
      clearDraft();
      refetch();
    });
  const save = async (submit: boolean) => {
    if ((!submit && !canSave) || (submit && !canSubmit) || !snapshot || !year) return;
    const payload: AttendanceMark =
      retryPayload && retryPayload.submit === submit
        ? retryPayload
        : {
            academicYearId: year.id,
            standardId: selection.standard,
            divisionId: selection.division,
            date: selection.date,
            revision: snapshot.revision,
            rosterRevision: snapshot.rosterRevision,
            submit,
            operationId: crypto.randomUUID(),
            correctionReason: correctionReason.trim() || undefined,
            entries: rows
              .filter((row) => row.isExpected && !row.needsCreditCorrection)
              .map((row) => ({
                studentId: row.studentId,
                enrollmentId: row.enrollmentId,
                status: row.status,
                late: row.late,
                halfDay: row.halfDay,
                remarks: row.remarks || '',
              })),
          };
    setFailure('');
    setRetryPayload(payload);
    try {
      const result = await mark(payload).unwrap();
      setSnapshot({
        ...snapshot,
        revision: result.revision,
        isSubmitted: result.isSubmitted,
        students: rows,
      });
      setRetryPayload(null);
      setCorrectionReason('');
      setDecision(null);
      shikshaMitraToast.success({
        message: submit ? 'Attendance submitted.' : 'Attendance draft saved.',
      });
      refetch();
    } catch (problem) {
      const message = parseApiProblemDetail(problem).detail;
      setFailure(message);
      shikshaMitraToast.error({ message });
    }
  };
  const toggleLock = async () => {
    if (!canManageLock || !year || !snapshot?.attendanceDayId || busy || dirty) return;
    const payload = {
      academicYearId: year.id,
      standardId: selection.standard,
      divisionId: selection.division,
      date: selection.date,
    };
    try {
      await (authoritative?.isLocked ? unlock(payload) : lock(payload)).unwrap();
      setDecision(null);
      shikshaMitraToast.success({
        message: authoritative?.isLocked ? 'Attendance unlocked.' : 'Attendance locked.',
      });
    } catch (problem) {
      setFailure(parseApiProblemDetail(problem).detail);
    }
  };

  const columns: IColumn[] = [
    {
      id: 'rollNo',
      label: 'Roll no.',
      width: 85,
      filterType: 'string',
      render: (value) => value ?? '—',
    },
    {
      id: 'name',
      label: 'Student',
      minWidth: 200,
      filterType: 'string',
      render: (_value, item) => {
        const row = item as AttendanceStudent;
        return (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {attendanceStudentName(row)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GR no. {row.grNo ?? '—'}
            </Typography>
            {row.scheduleLabel && (
              <Typography variant="caption" color="text.secondary">
                {row.scheduleLabel}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'statusLabel',
      label: 'Attendance',
      minWidth: 225,
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      render: (_value, item) => {
        const row = item as AttendanceStudent;
        if (!row.isExpected)
          return (
            <Tooltip title={row.notExpectedReason || 'Not scheduled today'}>
              <span>
                <Label>Not expected</Label>
              </span>
            </Tooltip>
          );
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {[AttendanceStatus.Present, AttendanceStatus.Absent].map((status) => (
              <Button
                key={status}
                size="small"
                variant={row.status === status ? 'contained' : 'outlined'}
                color={status === AttendanceStatus.Present ? 'success' : 'error'}
                aria-pressed={row.status === status}
                aria-label={`${status === AttendanceStatus.Present ? 'Present' : 'Absent'}: ${attendanceStudentName(row)}`}
                disabled={
                  !editable || !!row.requiresCorrectionApproval || !!row.needsCreditCorrection
                }
                onClick={() =>
                  updateRow(row.studentId, (before) => changeAttendanceStatus(before, status))
                }
              >
                {status === AttendanceStatus.Present ? 'Present' : 'Absent'}
              </Button>
            ))}
            {row.status === AttendanceStatus.Pending && <Label color="warning">Unmarked</Label>}
          </Stack>
        );
      },
    },
    {
      id: 'detailLabel',
      label: 'Details',
      minWidth: 190,
      isSort: false,
      isFilter: false,
      render: (_value, item) => {
        const row = item as AttendanceStudent;
        return (
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {row.late && <Label color="warning">Late</Label>}
              {row.halfDay && <Label color="info">Half-day</Label>}
              {row.approvedLeaveId && <Label color="info">Approved leave</Label>}
              {row.needsCreditCorrection && <Label color="warning">Leave correction needed</Label>}
            </Stack>
            {row.remarks && (
              <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                {row.remarks}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 105,
      align: 'right',
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_value, item) => {
        const row = item as AttendanceStudent;
        return (
          <ThreeDotsActions
            showThreeDots={false}
            directActions={
              editable && !row.requiresCorrectionApproval && !row.needsCreditCorrection
                ? [
                    {
                      id: 'attendance-details',
                      label: `Edit attendance details: ${attendanceStudentName(row)}`,
                      icon: 'mdi:pencil-outline',
                      disabled: !editable || !row.isExpected,
                      onClick: () => setDetails(row),
                    },
                  ]
                : [
                    {
                      id: 'attendance-correction',
                      label: `Request attendance correction: ${attendanceStudentName(row)}`,
                      icon: 'mdi:history',
                      disabled:
                        !canRequestCorrection ||
                        busy ||
                        dirty ||
                        stale ||
                        !snapshot?.attendanceDayId ||
                        !snapshot.revision ||
                        row.status === AttendanceStatus.Pending,
                      tooltip:
                        row.status === AttendanceStatus.Pending
                          ? 'Attendance must be recorded before requesting a correction.'
                          : !canRequestCorrection
                            ? 'You do not have permission to request attendance corrections.'
                            : `Request attendance correction: ${attendanceStudentName(row)}`,
                      onClick: () => setRequestedCorrection(row),
                    },
                  ]
            }
          />
        );
      },
    },
  ];
  const tableRows = rows.map((row) => ({
    ...row,
    id: row.studentId,
    name: attendanceStudentName(row),
    statusLabel: !row.isExpected
      ? 'Not expected'
      : row.status === AttendanceStatus.Pending
        ? 'Unmarked'
        : row.status === AttendanceStatus.Present
          ? 'Present'
          : 'Absent',
    detailLabel: [
      row.late && 'Late',
      row.halfDay && 'Half-day',
      row.approvedLeaveId && 'Approved leave',
      row.needsCreditCorrection && 'Leave correction needed',
      row.remarks,
    ]
      .filter(Boolean)
      .join(' · '),
  }));
  const orderedColumns = [columns[0], columns[1], columns[3], columns[2], columns[4]];
  const empty =
    !year || !medium
      ? 'Choose an academic year and medium to open attendance.'
      : !organizations.length
        ? 'No academic classes are available in your current scope.'
        : !validSelection
          ? 'Choose a school level, class, division and a valid date.'
          : snapshot && !snapshot.isExpected
            ? snapshot.notExpectedReason || 'Attendance is not expected on this date.'
            : 'No eligible students are assigned to this class on the selected date.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Daily Attendance"
        description="Choose a class and date, mark attendance, then save a draft or submit the complete register."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Attendance', href: studentPaths.attendance.root },
          { name: 'Daily Attendance' },
        ]}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
          <DatePicker
            label="Date"
            value={dayjs(selection.date)}
            format="DD-MM-YYYY"
            disabled={busy}
            minDate={year?.startDate ? dayjs(year.startDate) : undefined}
            maxDate={year?.endDate ? dayjs(year.endDate) : undefined}
            onChange={(value: Dayjs | null) => {
              if (value?.isValid()) changeSelection({ date: toDateOnly(value) });
            }}
            slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 170 } } } }}
          />
          <CustomSelect
            label="School level"
            options={organizations}
            value={selection.organization}
            labelKey="name"
            valueKey="id"
            onChange={(value) =>
              changeSelection({ organization: String(value), standard: '', division: '' })
            }
            disabled={!medium || busy}
            formControlProps={{ sx: { width: { xs: '100%', sm: 170 } } }}
          />
          <CustomSelect
            label="Class"
            options={standards}
            value={selection.standard}
            labelKey="name"
            valueKey="id"
            onChange={(value) => changeSelection({ standard: String(value), division: '' })}
            disabled={!organization || busy}
            formControlProps={{ sx: { width: { xs: '100%', sm: 140 } } }}
          />
          <CustomSelect
            label="Division"
            options={divisions}
            value={selection.division}
            labelKey="name"
            valueKey="id"
            onChange={(value) => changeSelection({ division: String(value) })}
            disabled={!standard || busy}
            formControlProps={{ sx: { width: { xs: '100%', sm: 140 } } }}
          />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            disabled={!canSave}
            loading={saving}
            onClick={() => save(false)}
          >
            Save draft
          </Button>
          <Tooltip
            title={
              counts.unmarked
                ? `Mark all ${counts.unmarked} remaining students before submitting.`
                : ''
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                disabled={!canSubmit}
                loading={saving}
                onClick={() => setDecision('submit')}
              >
                Submit attendance
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      {isFetching && <LinearProgress aria-label="Refreshing attendance" />}
      {academicContextChanged && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              disabled={busy}
              onClick={() =>
                requestNavigation(() => {
                  clearDraft();
                  setAcademicContext({ year: globals.currentYear, medium: globals.currentMedium });
                  replaceSelection({ ...selection, organization: '', standard: '', division: '' });
                })
              }
            >
              Switch context
            </Button>
          }
        >
          This draft remains in {year?.name || 'the previous academic year'} and{' '}
          {medium?.name || 'the previous medium'}. Save or discard it before switching to the
          selected academic context.
        </Alert>
      )}
      {validSelection && isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={refresh} disabled={busy}>
              Retry
            </Button>
          }
        >
          Attendance could not be loaded. {parseApiProblemDetail(error).detail}
          {dirty && ' Your unsaved changes are retained.'}
        </Alert>
      )}
      {failure && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={refresh} disabled={busy}>
              Review latest
            </Button>
          }
        >
          {failure} Your draft is retained.
        </Alert>
      )}
      {stale && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={refresh} disabled={busy}>
              Review latest
            </Button>
          }
        >
          The register or student roster changed after this draft was loaded. Review the latest
          version before saving.
        </Alert>
      )}
      {snapshot && !snapshot.isExpected && (
        <Alert severity="info">
          {snapshot.notExpectedReason || 'Attendance is not expected on this date.'}
        </Alert>
      )}
      {snapshot?.needsReview && (
        <Alert severity="warning">Roster changed after submission. Review and submit again.</Alert>
      )}
      {needsCreditCorrection && (
        <Alert severity="warning">
          Approved leave changed after attendance was submitted. Request corrections for rows marked
          “Leave correction needed” before submitting this register again.
        </Alert>
      )}
      {snapshot?.isExpected && !snapshot.isSubmitted && snapshot.isPastMarkingCutoff && (
        <Alert severity="warning">
          The school marking cutoff has passed. Review and submit the attendance register.
        </Alert>
      )}
      {snapshot && snapshot.isExpected && (!canAdd || !authoritative?.canMark) && (
        <Alert severity="info">
          This register is read-only. Your permission, teacher assignment or correction policy does
          not allow marking here.
          <Button size="small" href={studentPaths.attendance.leaveAndAbsent}>
            Leave &amp; Corrections
          </Button>
        </Alert>
      )}
      {snapshot && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Label
            color={
              authoritative?.isLocked ? 'warning' : snapshot.isSubmitted ? 'success' : 'default'
            }
          >
            {authoritative?.isLocked ? 'Locked' : snapshot.isSubmitted ? 'Submitted' : 'Draft'}
          </Label>
          <Typography variant="body2">
            Expected {counts.expected} · Present {counts.present} · Absent {counts.absent} ·
            Unmarked {counts.unmarked}
            {counts.notExpected > 0 && ` · Not expected ${counts.notExpected}`}
          </Typography>
          {dirty && <Label color="warning">Unsaved changes</Label>}
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            disabled={
              !editable ||
              !rows.some(
                (row) =>
                  row.isExpected && row.status === AttendanceStatus.Pending && !row.approvedLeaveId
              )
            }
            onClick={() => {
              setRetryPayload(null);
              setRows(markRemainingPresent(rows));
            }}
          >
            Mark remaining present
          </Button>
          <Button
            size="small"
            color="inherit"
            disabled={!dirty || busy}
            onClick={() => setDecision('discard')}
          >
            Discard changes
          </Button>
          {canManageLock && (
            <Tooltip
              title={
                dirty
                  ? 'Save or discard your changes first.'
                  : !snapshot.isSubmitted && !authoritative?.isLocked
                    ? 'Submit the register before locking it.'
                    : ''
              }
            >
              <span>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={
                    <Iconify
                      icon={authoritative?.isLocked ? 'mdi:lock-open-outline' : 'mdi:lock-outline'}
                    />
                  }
                  disabled={
                    busy ||
                    dirty ||
                    !snapshot.attendanceDayId ||
                    (!snapshot.isSubmitted && !authoritative?.isLocked)
                  }
                  onClick={() => setDecision('lock')}
                >
                  {authoritative?.isLocked ? 'Unlock' : 'Lock'}
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      )}
      {reasonRequired && (
        <TextField
          size="small"
          label="Correction reason"
          value={correctionReason}
          onChange={(event) => {
            setCorrectionReason(event.target.value);
            setRetryPayload(null);
          }}
          disabled={busy}
          helperText={
            leaveConflict
              ? 'Explain why the student was present during approved leave. The reason is retained in the attendance history.'
              : 'Required when changing a submitted register. The reason is retained in the attendance history.'
          }
          inputProps={{ maxLength: 500 }}
        />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-daily-attendance"
          tableTitle="Class register"
          columns={orderedColumns}
          data={tableRows}
          isLoading={validSelection && !snapshot && (isLoading || isFetching)}
          isSearch
          isPagination
          isFilter={false}
          page={tableQuery.page}
          rowsPerPage={tableQuery.rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          searchTerm={tableQuery.searchTerm}
          sorts={tableQuery.sorts}
          searchFieldProps={{ placeholder: 'Search students by name, roll no. or GR no.' }}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText={
            <Stack alignItems="center" spacing={1}>
              <Iconify icon="mdi:calendar-check-outline" width={40} />
              <Typography variant="body2">
                {validSelection && isError
                  ? 'Attendance could not be loaded. Use Retry above.'
                  : empty}
              </Typography>
            </Stack>
          }
        />
      </Box>
      {details && snapshot && (
        <AttendanceDetailsDialog
          student={details}
          policy={snapshot.policy}
          onClose={() => setDetails(null)}
          onApply={(row) => updateRow(row.studentId, () => row)}
        />
      )}
      {requestedCorrection && snapshot?.revision && year && (
        <AttendanceCorrectionDialog
          student={requestedCorrection}
          policy={snapshot.policy}
          revision={snapshot.revision}
          scope={{
            academicYearId: year.id,
            standardId: selection.standard,
            divisionId: selection.division,
            date: selection.date,
          }}
          onClose={() => setRequestedCorrection(null)}
        />
      )}
      <ConfirmDialog
        open={decision !== null}
        disableBackdropClick
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        onClose={() => {
          if (!busy) setDecision(null);
        }}
        icon={decision === 'discard' ? 'error' : 'info'}
        title={
          decision === 'submit'
            ? 'Submit attendance?'
            : decision === 'discard'
              ? 'Discard unsaved attendance?'
              : authoritative?.isLocked
                ? 'Unlock attendance?'
                : 'Lock attendance?'
        }
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              {decision === 'submit'
                ? `Submit the complete register for ${formatDateOnly(selection.date)}? All ${counts.expected} expected students have been marked.`
                : decision === 'discard'
                  ? 'Your unsaved marks and notes will be replaced with the last saved register.'
                  : authoritative?.isLocked
                    ? 'Unlocking allows corrections according to your school policy. Previous-day changes still require approval.'
                    : 'Lock this submitted register to require approved corrections.'}
            </Typography>
            {failure && <Alert severity="error">{failure} Your draft is retained.</Alert>}
          </Stack>
        }
        action={
          <Button
            variant="contained"
            color={decision === 'discard' ? 'error' : 'primary'}
            loading={busy}
            disabled={busy}
            onClick={() => {
              if (decision === 'submit') save(true);
              else if (decision === 'lock') toggleLock();
              else {
                setRows(normalizeAttendanceRows(snapshot?.students || []));
                setRetryPayload(null);
                setFailure('');
                setDecision(null);
              }
            }}
          >
            {decision === 'submit'
              ? 'Submit attendance'
              : decision === 'discard'
                ? 'Discard changes'
                : authoritative?.isLocked
                  ? 'Unlock attendance'
                  : 'Lock attendance'}
          </Button>
        }
      />
      {confirmation}
    </Box>
  );
};

export default function TakeAttendanceScreen() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
          <CustomBreadcrumbs
            heading="Daily Attendance"
            description="Choose a class and date to record daily attendance."
            links={[
              { name: 'Student', href: studentPaths.dashboard },
              { name: 'Attendance', href: studentPaths.attendance.root },
              { name: 'Daily Attendance' },
            ]}
          />
          <LinearProgress aria-label="Loading daily attendance" />
        </Box>
      }
    >
      <DailyAttendanceWorkspace />
    </Suspense>
  );
}
