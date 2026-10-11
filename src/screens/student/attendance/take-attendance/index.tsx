'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Board, Division, Standards, Organization } from 'src/types/school';
import type {
  AttendanceDay,
  AttendanceMark,
  AttendanceStudent,
} from 'src/redux/student/take-attendance/attendance-types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
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
  Paper,
  Button,
  Tooltip,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useMarkAttendanceMutation,
  useLockAttendanceMutation,
  useGetAttendanceByFilterQuery,
} from 'src/redux/student/take-attendance/take-attendace-api';

import AttendanceDetailsDialog from './attendance-details-dialog';
import { readAttendanceTableQuery } from './attendance-url-state';
import AttendanceCorrectionDialog from './attendance-correction-dialog';
import {
  getAttendanceCounts,
  hasAttendanceChanges,
  changeAttendanceMark,
  attendanceStudentName,
  normalizeAttendanceRows,
} from './attendance-draft';

type Selection = {
  date: string;
  board: string;
  medium: string;
  organization: string;
  standard: string;
  division: string;
};
const attendanceMarks = [
  { value: 'full', label: 'Full day', icon: 'eva:checkmark-fill', color: 'success' },
  { value: 'half', label: 'Half day', icon: 'mdi:fraction-one-half', color: 'info' },
  { value: 'pending', label: 'Pending', icon: 'eva:minus-fill', color: 'warning' },
  { value: 'absent', label: 'Absent', icon: 'eva:close-fill', color: 'error' },
] as const;
const attendanceSegmentButton = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.2s',
};
const today = () => toDateOnly(dayjs());
const attendanceSearchFields = ['name', 'rollNo', 'grNo'];
const readAcademicPath = (
  params: URLSearchParams,
  boards: Board[],
  currentBoardId?: string,
  currentMediumId?: string
) => {
  const boardId =
    params.get('board') ||
    currentBoardId ||
    boards.find((item) => item.educationMediums?.some((medium) => medium.id === currentMediumId))
      ?.id ||
    boards[0]?.id ||
    '';
  const mediums = boards.find((item) => item.id === boardId)?.educationMediums || [];
  const mediumId =
    params.get('medium') ||
    (mediums.some((item) => item.id === currentMediumId) ? currentMediumId : mediums[0]?.id) ||
    '';
  return { board: boardId, medium: mediumId };
};
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
    board: globals.currentBoard,
    medium: globals.currentMedium,
  });
  const { year } = academicContext;
  const [selection, setSelection] = useState<Selection>(() => ({
    date: searchParams.get('date') || today(),
    ...readAcademicPath(
      new URLSearchParams(searchParams.toString()),
      year?.boards || [],
      globals.currentBoard?.id,
      globals.currentMedium?.id
    ),
    organization: searchParams.get('organization') || '',
    standard: searchParams.get('class') || '',
    division: searchParams.get('division') || '',
  }));
  const [snapshot, setSnapshot] = useState<AttendanceDay | null>(null);
  const [rows, setRows] = useState<AttendanceStudent[]>([]);
  const [details, setDetails] = useState<AttendanceStudent | null>(null);
  const [requestedCorrection, setRequestedCorrection] = useState<AttendanceStudent | null>(null);
  const [decision, setDecision] = useState<'lock' | null>(null);
  const [failure, setFailure] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [retryPayload, setRetryPayload] = useState<AttendanceMark | null>(null);
  const contextSeen = useRef(
    `${globals.currentYear?.id}/${globals.currentBoard?.id}/${globals.currentMedium?.id}`
  );
  const lastUrl = useRef(searchParams.toString());
  const lastAppliedData = useRef<AttendanceDay | undefined>(undefined);
  const dirty = snapshot ? hasAttendanceChanges(rows, snapshot.students) : false;
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, { push: router.push });
  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();
  const [lock, { isLoading: locking }] = useLockAttendanceMutation();
  const busy = saving || locking;
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
  const boards: Board[] = year?.boards || [];
  const board = boards.find((item) => item.id === selection.board);
  const mediums = board?.educationMediums || [];
  const medium = mediums.find((item) => item.id === selection.medium);
  const organizations: Organization[] = medium?.educationMediumStages?.length
    ? medium.educationMediumStages
    : academicContext.medium?.id === medium?.id
      ? academicContext.medium.educationMediumStages || []
      : [];
  const organization = organizations.find((item) => item.id === selection.organization);
  const standards: Standards[] = organization?.standards || [];
  const standard = standards.find((item) => item.id === selection.standard);
  const divisions: Division[] = standard?.divisions || [];
  const validSelection =
    !!year?.id &&
    !!medium &&
    !!divisions.find((item) => item.id === selection.division) &&
    dayjs(selection.date).isValid() &&
    selection.date === toDateOnly(dayjs(selection.date)) &&
    selection.date <= today() &&
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
        board: next.board,
        medium: next.medium,
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
      ...readAcademicPath(
        new URLSearchParams(searchParams.toString()),
        year?.boards || [],
        globals.currentBoard?.id,
        globals.currentMedium?.id
      ),
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
  }, [
    searchParams,
    clearDraft,
    selection,
    globals.currentBoard?.id,
    globals.currentMedium?.id,
    year?.boards,
  ]);

  // A global year or medium switch must not silently discard the locally owned draft.
  useEffect(() => {
    const nextKey = `${globals.currentYear?.id}/${globals.currentBoard?.id}/${globals.currentMedium?.id}`;
    if (contextSeen.current === nextKey) return;
    contextSeen.current = nextKey;
    requestNavigation(() => {
      clearDraft();
      setAcademicContext({
        year: globals.currentYear,
        board: globals.currentBoard,
        medium: globals.currentMedium,
      });
      replaceSelection({
        ...selection,
        board: globals.currentBoard?.id || globals.currentYear?.boards?.[0]?.id || '',
        medium: globals.currentMedium?.id || '',
        organization: '',
        standard: '',
        division: '',
      });
    });
  }, [
    globals.currentYear,
    globals.currentBoard,
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
  const markCounts = {
    full: rows.filter(
      (row) => row.isExpected && row.status === AttendanceStatus.Present && !row.halfDay
    ).length,
    half: rows.filter(
      (row) => row.isExpected && row.status === AttendanceStatus.Present && row.halfDay
    ).length,
    pending: rows.filter((row) => row.isExpected && row.status === AttendanceStatus.Pending).length,
    absent: rows.filter((row) => row.isExpected && row.status === AttendanceStatus.Absent).length,
  };
  const academicContextChanged =
    year?.id !== globals.currentYear?.id ||
    academicContext.board?.id !== globals.currentBoard?.id ||
    academicContext.medium?.id !== globals.currentMedium?.id;
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
  const canFinalize =
    editable &&
    canManageLock &&
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
  const save = async (finalize: boolean) => {
    if ((!finalize && !canSave) || (finalize && !canFinalize) || !snapshot || !year) return;
    const submit = finalize;
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
      const result = await markAttendance(payload).unwrap();
      setSnapshot({
        ...snapshot,
        attendanceDayId: result.attendanceDayId || snapshot.attendanceDayId,
        revision: result.revision,
        isSubmitted: result.isSubmitted,
        students: rows,
      });
      setRetryPayload(null);
      setCorrectionReason('');
      if (finalize) {
        try {
          await lock({
            academicYearId: year.id,
            standardId: selection.standard,
            divisionId: selection.division,
            date: selection.date,
          }).unwrap();
          setDecision(null);
          shikshaMitraToast.success({ message: 'Attendance locked.' });
        } catch (lockProblem) {
          const message = `Attendance was submitted, but locking failed. ${parseApiProblemDetail(lockProblem).detail}`;
          setFailure(message);
          setDecision(null);
          shikshaMitraToast.error({ message });
        }
      } else {
        shikshaMitraToast.success({ message: 'Attendance saved.' });
      }
      refetch();
    } catch (problem) {
      const message = parseApiProblemDetail(problem).detail;
      setFailure(message);
      shikshaMitraToast.error({ message });
    }
  };
  const lockSubmitted = async () => {
    if (
      !canManageLock ||
      !year ||
      !snapshot?.attendanceDayId ||
      !snapshot.isSubmitted ||
      snapshot.needsReview ||
      authoritative?.isLocked ||
      counts.unmarked > 0 ||
      busy ||
      dirty ||
      !validSelection
    )
      return;
    const payload = {
      academicYearId: year.id,
      standardId: selection.standard,
      divisionId: selection.division,
      date: selection.date,
    };
    try {
      await lock(payload).unwrap();
      setDecision(null);
      shikshaMitraToast.success({ message: 'Attendance locked.' });
      refetch();
    } catch (problem) {
      setFailure(parseApiProblemDetail(problem).detail);
      setDecision(null);
    }
  };

  const columns: IColumn[] = [
    {
      id: 'rollNo',
      label: 'Roll no.',
      width: 85,
      filterType: 'string',
      isFilter: false,
      render: (value) => value ?? '—',
    },
    {
      id: 'name',
      label: 'Student',
      minWidth: 200,
      filterType: 'string',
      isFilter: false,
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
      label: (
        <Stack spacing={0.5} alignItems="center" sx={{ width: 230 }}>
          <Typography variant="caption" fontWeight={600}>
            Attendance
          </Typography>
          <Box sx={{ display: 'flex', width: 230, gap: 0.25, px: 0.25 }}>
            {attendanceMarks.map((mark) => (
              <CustomTooltip
                key={mark.value}
                title={`${mark.label}: ${markCounts[mark.value]}`}
                arrow
              >
                <Box
                  sx={{
                    flex: 1,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    bgcolor: (theme) => alpha(theme.palette[mark.color].main, 0.16),
                    color: `${mark.color}.dark`,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {markCounts[mark.value]}
                </Box>
              </CustomTooltip>
            ))}
          </Box>
        </Stack>
      ),
      width: 250,
      minWidth: 250,
      maxWidth: 250,
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      render: (_value, item) => {
        const row = item as AttendanceStudent;
        return (
          <Box
            sx={{
              display: 'flex',
              width: 230,
              height: 32,
              bgcolor: 'background.neutral',
              borderRadius: '6px',
              p: 0.25,
              gap: 0.25,
            }}
          >
            {attendanceMarks.map((mark) => {
              const selected =
                (mark.value === 'full' &&
                  row.status === AttendanceStatus.Present &&
                  !row.halfDay) ||
                (mark.value === 'half' && row.status === AttendanceStatus.Present && row.halfDay) ||
                (mark.value === 'pending' && row.status === AttendanceStatus.Pending) ||
                (mark.value === 'absent' && row.status === AttendanceStatus.Absent);
              const disabled =
                !editable ||
                !row.isExpected ||
                !!row.requiresCorrectionApproval ||
                !!row.needsCreditCorrection ||
                (mark.value === 'half' && !snapshot?.policy.allowHalfDay) ||
                (mark.value === 'pending' && !!snapshot?.isSubmitted);
              return (
                <CustomTooltip
                  key={mark.value}
                  title={
                    !row.isExpected
                      ? row.notExpectedReason || 'Attendance is unavailable for this student.'
                      : mark.label
                  }
                  arrow
                  placement="top"
                >
                  <Box component="span" sx={{ display: 'flex', flex: 1 }}>
                    <Box
                      component="button"
                      type="button"
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={`${mark.label}: ${attendanceStudentName(row)}`}
                      onClick={() =>
                        updateRow(row.studentId, (before) =>
                          changeAttendanceMark(before, mark.value)
                        )
                      }
                      sx={{
                        ...attendanceSegmentButton,
                        width: 1,
                        border: 0,
                        p: 0,
                        font: 'inherit',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        bgcolor: selected
                          ? (theme) => theme.palette[mark.color].main
                          : 'transparent',
                        color: selected
                          ? (theme) => theme.palette[mark.color].contrastText
                          : (theme) => theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: selected
                            ? (theme) => theme.palette[mark.color].dark
                            : (theme) => alpha(theme.palette[mark.color].main, 0.08),
                        },
                      }}
                    >
                      <Iconify icon={mark.icon} width={18} />
                    </Box>
                  </Box>
                </CustomTooltip>
              );
            })}
          </Box>
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
    statusLabel:
      row.status === AttendanceStatus.Pending
        ? 'Pending'
        : row.status === AttendanceStatus.Present
          ? row.halfDay
            ? 'Half day'
            : 'Full day'
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
  const orderedColumns = [columns[0], columns[1], columns[2], columns[3], columns[4]];
  const empty =
    selection.date > today()
      ? 'Attendance cannot be taken for a future date.'
      : !year || !board || !medium
        ? 'Choose a board and medium to open attendance.'
        : !organizations.length
          ? 'No academic classes are available in your current scope.'
          : !validSelection
            ? 'Choose a board, medium, school level, class, division and a valid date.'
            : snapshot && !snapshot.isExpected
              ? snapshot.notExpectedReason || 'Attendance is not expected on this date.'
              : 'No eligible students are assigned to this class on the selected date.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Daily Attendance"
        description="Choose a class and date, then save your marks or lock a complete register."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Attendance', href: studentPaths.attendance.root },
          { name: 'Daily Attendance' },
        ]}
      />
      <Paper variant="outlined" sx={{ px: 1, py: 1, overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(145px, 1fr)) auto auto',
            gap: 1,
            alignItems: 'center',
            minWidth: 1080,
          }}
        >
          <DatePicker
            label="Date"
            value={dayjs(selection.date)}
            format="DD-MM-YYYY"
            disabled={busy}
            disableFuture
            minDate={year?.startDate ? dayjs(year.startDate) : undefined}
            maxDate={year?.endDate && year.endDate < today() ? dayjs(year.endDate) : dayjs()}
            onChange={(value: Dayjs | null) => {
              if (value?.isValid()) changeSelection({ date: toDateOnly(value) });
            }}
            slotProps={{ textField: { size: 'small', sx: { width: 1 } } }}
          />
          <CustomSelect
            fullWidth
            label="Board"
            options={boards}
            value={board?.id || ''}
            labelKey="name"
            valueKey="id"
            onChange={(value) => {
              const nextBoard = boards.find((item) => item.id === String(value));
              changeSelection({
                board: String(value),
                medium: nextBoard?.educationMediums?.[0]?.id || '',
                organization: '',
                standard: '',
                division: '',
              });
            }}
            disabled={!boards.length || busy}
          />
          <CustomSelect
            fullWidth
            label="Medium"
            options={mediums}
            value={medium?.id || ''}
            labelKey="name"
            valueKey="id"
            onChange={(value) =>
              changeSelection({
                medium: String(value),
                organization: '',
                standard: '',
                division: '',
              })
            }
            disabled={!board || busy}
          />
          <CustomSelect
            fullWidth
            label="School level"
            options={organizations}
            value={selection.organization}
            labelKey="name"
            valueKey="id"
            onChange={(value) =>
              changeSelection({ organization: String(value), standard: '', division: '' })
            }
            disabled={!medium || busy}
          />
          <CustomSelect
            fullWidth
            label="Class"
            options={standards}
            value={selection.standard}
            labelKey="name"
            valueKey="id"
            onChange={(value) => changeSelection({ standard: String(value), division: '' })}
            disabled={!organization || busy}
          />
          <CustomSelect
            fullWidth
            label="Division"
            options={divisions}
            value={selection.division}
            labelKey="name"
            valueKey="id"
            onChange={(value) => changeSelection({ division: String(value) })}
            disabled={!standard || busy}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={!canSave}
            loading={saving}
            onClick={() => save(false)}
          >
            Save
          </Button>
          <Tooltip
            title={
              counts.unmarked ? `Mark all ${counts.unmarked} pending students before locking.` : ''
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:lock-outline" width={16} />}
                disabled={
                  !(
                    canFinalize ||
                    (snapshot?.isSubmitted &&
                      !snapshot.needsReview &&
                      !!snapshot.attendanceDayId &&
                      !dirty &&
                      !stale &&
                      !authoritative?.isLocked &&
                      canManageLock &&
                      counts.unmarked === 0 &&
                      !needsCreditCorrection &&
                      validSelection)
                  )
                }
                loading={busy}
                onClick={() => setDecision('lock')}
              >
                Lock
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Paper>
      {selection.date > today() && (
        <Alert severity="warning">Attendance cannot be taken for a future date.</Alert>
      )}
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
                  setAcademicContext({
                    year: globals.currentYear,
                    board: globals.currentBoard,
                    medium: globals.currentMedium,
                  });
                  replaceSelection({
                    ...selection,
                    board: globals.currentBoard?.id || globals.currentYear?.boards?.[0]?.id || '',
                    medium: globals.currentMedium?.id || '',
                    organization: '',
                    standard: '',
                    division: '',
                  });
                })
              }
            >
              Switch context
            </Button>
          }
        >
          This draft remains in {year?.name || 'the previous academic year'} and{' '}
          {academicContext.medium?.name || 'the previous medium'}. Save or discard it before
          switching to the selected academic context.
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
          {failure}
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
            Leave Requests
          </Button>
        </Alert>
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
          defaultRowsPerPage={tableQuery.rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          defaultSearchTerm={tableQuery.searchTerm}
          searchableFields={attendanceSearchFields}
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
        icon="info"
        title="Lock attendance?"
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              Submit and lock the complete register for {formatDateOnly(selection.date)}? All{' '}
              {counts.expected} expected students have been marked. Corrections will require
              approval according to school policy.
            </Typography>
            {failure && <Alert severity="error">{failure}</Alert>}
          </Stack>
        }
        action={
          <Button
            variant="contained"
            color="primary"
            loading={busy}
            disabled={busy}
            onClick={() => {
              if (snapshot?.isSubmitted && !dirty && !snapshot.needsReview) lockSubmitted();
              else save(true);
            }}
          >
            Lock attendance
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
