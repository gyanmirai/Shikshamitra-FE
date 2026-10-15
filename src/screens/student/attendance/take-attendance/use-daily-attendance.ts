import type { RootState } from 'src/redux/store';
import type { AcademicYear } from 'src/types/school';
import type {
  AttendanceDay,
  AttendanceMark,
  AttendanceStudent,
} from 'src/redux/student/take-attendance/attendance-types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { toDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  useMarkAttendanceMutation,
  useLockAttendanceMutation,
  useGetAttendanceContextQuery,
  useGetAttendanceByFilterQuery,
  useGetAttendanceWorkspaceQuery,
} from 'src/redux/student/take-attendance/take-attendace-api';

import { readAttendanceTableQuery } from './attendance-url-state';
import { attendanceStatusLabel, buildAttendanceColumns } from './attendance-register-columns';
import {
  getAttendanceCounts,
  hasAttendanceChanges,
  markRemainingPresent,
  attendanceStudentName,
  normalizeAttendanceRows,
} from './attendance-draft';

type Selection = {
  date: string;
  board: string;
  medium: string;
  standard: string;
  division: string;
};
const readSelection = (query: string): Selection => {
  const p = new URLSearchParams(query);
  return {
    date: p.get('date') || '',
    board: p.get('board') || '',
    medium: p.get('medium') || '',
    standard: p.get('class') || '',
    division: p.get('division') || '',
  };
};

export function useDailyAttendance(academicYearOverride?: AcademicYear) {
  const router = useRouter();
  const pathname = usePathname();
  const queryString = useSearchParams().toString();
  const globals = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [academicContext, setAcademicContext] = useState({
    year: academicYearOverride ?? globals.currentYear,
    board: globals.currentBoard,
    medium: globals.currentMedium,
  });
  const { year } = academicContext;
  const [selection, setSelection] = useState(() => readSelection(queryString));
  const tableQuery = useMemo(() => readAttendanceTableQuery(queryString), [queryString]);
  const [snapshot, setSnapshot] = useState<AttendanceDay | null>(null);
  const [rows, setRows] = useState<AttendanceStudent[]>([]);
  const [failure, setFailure] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [retryPayload, setRetryPayload] = useState<AttendanceMark | null>(null);
  const [decision, setDecision] = useState<'submit' | 'lock' | null>(null);
  const [mark, { isLoading: saving }] = useMarkAttendanceMutation();
  const [lock, { isLoading: locking }] = useLockAttendanceMutation();
  const busy = saving || locking;
  const dirty = snapshot ? hasAttendanceChanges(rows, snapshot.students) : false;
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy,
  });
  const lastApplied = useRef<AttendanceDay | undefined>(undefined);
  const seenUrl = useRef(queryString);
  const initializedYear = useRef('');
  const globalKey = `${globals.currentYear?.id}/${globals.currentBoard?.id}/${globals.currentMedium?.id}`;
  const seenGlobal = useRef(globalKey);
  const contextQuery = useGetAttendanceContextQuery(
    { academicYearId: year?.id || '' },
    {
      skip: !year?.id,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const context = !contextQuery.isError ? contextQuery.currentData : undefined;
  const options = context?.options;
  const schoolToday = context?.schoolToday.slice(0, 10) || '';
  const validDate =
    !!schoolToday &&
    /^\d{4}-\d{2}-\d{2}$/.test(selection.date) &&
    dayjs(selection.date).isValid() &&
    toDateOnly(dayjs(selection.date)) === selection.date &&
    selection.date <= schoolToday &&
    (!year?.startDate || selection.date >= toDateOnly(year.startDate)) &&
    (!year?.endDate || selection.date <= toDateOnly(year.endDate));
  const mediums = (options?.mediums || []).filter(
    (m) => !selection.board || m.parentId === selection.board
  );
  const classes = (options?.standards || [])
    .filter((s) => !selection.medium || s.parentId === selection.medium)
    .filter((s) => !selection.board || mediums.some((m) => m.id === s.parentId));
  const divisions = (options?.divisions || [])
    .filter((d) => !selection.standard || d.parentId === selection.standard)
    .filter(
      (d) => (!selection.board && !selection.medium) || classes.some((s) => s.id === d.parentId)
    );
  const validFilters =
    !!options &&
    (!selection.board || options.boards.some((b) => b.id === selection.board)) &&
    (!selection.medium || mediums.some((m) => m.id === selection.medium)) &&
    (!selection.standard || classes.some((s) => s.id === selection.standard)) &&
    (!selection.division || divisions.some((d) => d.id === selection.division));
  const validSelection = !!year?.id && validDate && validFilters;
  const classRegister = validSelection && !!selection.standard && !!selection.division;
  const rosterQuery = useGetAttendanceByFilterQuery(
    {
      AcademicYearId: year?.id || '',
      StandardId: selection.standard,
      DivisionId: selection.division,
      Date: selection.date,
    },
    {
      skip: !classRegister,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const workspaceQuery = useGetAttendanceWorkspaceQuery(
    {
      academicYearId: year?.id || '',
      date: selection.date,
      boardId: selection.board || undefined,
      mediumId: selection.medium || undefined,
      standardId: selection.standard || undefined,
      divisionId: selection.division || undefined,
      search: tableQuery.searchTerm,
      sorting:
        tableQuery.sorts[0] && tableQuery.sorts[0].column !== 'rollNo'
          ? `${tableQuery.sorts[0].column} ${tableQuery.sorts[0].direction}`
          : undefined,
      skipCount: tableQuery.page * tableQuery.rowsPerPage,
      maxResultCount: tableQuery.rowsPerPage,
    },
    {
      skip: !validSelection || classRegister,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const clearDraft = useCallback(() => {
    lastApplied.current = undefined;
    setSnapshot(null);
    setRows([]);
    setFailure('');
    setRetryPayload(null);
    setCorrectionReason('');
    setDecision(null);
  }, []);
  const updateUrl = useCallback(
    (values: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(queryString);
      Object.entries(values).forEach(([key, value]) =>
        value === undefined || value === '' ? next.delete(key) : next.set(key, String(value))
      );
      const href = `${pathname}${next.size ? `?${next.toString()}` : ''}`;
      if (href !== `${pathname}${queryString ? `?${queryString}` : ''}`)
        router.replace(href, { scroll: false });
    },
    [pathname, queryString, router]
  );
  const replaceSelection = useCallback(
    (next: Selection) => {
      clearDraft();
      setSelection(next);
      updateUrl({
        date: next.date,
        board: next.board,
        medium: next.medium,
        class: next.standard,
        division: next.division,
        organization: undefined,
        page: 0,
      });
    },
    [clearDraft, updateUrl]
  );
  const changeSelection = (changes: Partial<Selection>) =>
    requestNavigation(() => replaceSelection({ ...selection, ...changes }));
  useEffect(() => {
    if (seenUrl.current === queryString) return;
    seenUrl.current = queryString;
    const next = readSelection(queryString);
    if (
      Object.keys(next).every(
        (key) => next[key as keyof Selection] === selection[key as keyof Selection]
      )
    )
      return;
    clearDraft();
    setSelection(next);
  }, [queryString, selection, clearDraft]);
  useEffect(() => {
    if (!context || !year || initializedYear.current === year.id) return;
    initializedYear.current = year.id;
    let next = { ...selection, date: selection.date || schoolToday };
    if (
      !context.isAdmin &&
      !selection.standard &&
      !selection.division &&
      context.assignedClasses.length === 1
    ) {
      const assigned = context.assignedClasses[0];
      const standard = context.options.standards.find((s) => s.id === assigned.standardId);
      const medium = context.options.mediums.find((m) => m.id === standard?.parentId);
      next = {
        ...next,
        board: medium?.parentId || '',
        medium: medium?.id || '',
        standard: assigned.standardId,
        division: assigned.divisionId,
      };
    }
    if (JSON.stringify(next) !== JSON.stringify(selection)) replaceSelection(next);
  }, [context, year, schoolToday, selection, replaceSelection]);
  const switchContext = () =>
    requestNavigation(() => {
      clearDraft();
      initializedYear.current = '';
      setAcademicContext({
        year: globals.currentYear,
        board: globals.currentBoard,
        medium: globals.currentMedium,
      });
      replaceSelection({ date: '', board: '', medium: '', standard: '', division: '' });
    });
  useEffect(() => {
    if (!academicYearOverride || academicYearOverride.id === academicContext.year?.id) return;
    requestNavigation(() => {
      clearDraft();
      initializedYear.current = '';
      setAcademicContext({
        year: academicYearOverride,
        board: globals.currentBoard,
        medium: globals.currentMedium,
      });
      setSelection(readSelection(queryString));
    });
  }, [
    academicYearOverride,
    academicContext.year?.id,
    requestNavigation,
    clearDraft,
    globals.currentBoard,
    globals.currentMedium,
    queryString,
  ]);
  useEffect(() => {
    if (academicYearOverride) return;
    if (seenGlobal.current === globalKey) return;
    seenGlobal.current = globalKey;
    // The application shell hydrates its academic context after a full page load.
    // Keep the requested register in the URL during that initial hydration.
    if (!academicContext.year?.id && globals.currentYear?.id) {
      setAcademicContext({
        year: globals.currentYear,
        board: globals.currentBoard,
        medium: globals.currentMedium,
      });
      return;
    }
    requestNavigation(() => {
      clearDraft();
      initializedYear.current = '';
      setAcademicContext({
        year: globals.currentYear,
        board: globals.currentBoard,
        medium: globals.currentMedium,
      });
      replaceSelection({ date: '', board: '', medium: '', standard: '', division: '' });
    });
  }, [
    globalKey,
    academicYearOverride,
    globals.currentYear,
    globals.currentBoard,
    globals.currentMedium,
    academicContext.year?.id,
    requestNavigation,
    clearDraft,
    replaceSelection,
  ]);
  const currentData = !rosterQuery.isError && classRegister ? rosterQuery.currentData : undefined;
  useEffect(() => {
    if (!currentData || dirty || busy || lastApplied.current === currentData) return;
    lastApplied.current = currentData;
    setSnapshot({ ...currentData, students: normalizeAttendanceRows(currentData.students) });
    setRows(normalizeAttendanceRows(currentData.students));
  }, [currentData, dirty, busy]);
  const authoritative = currentData || snapshot;
  const stale =
    !!snapshot &&
    !!currentData &&
    (snapshot.revision !== currentData.revision ||
      snapshot.rosterRevision !== currentData.rosterRevision);
  const counts = useMemo(() => getAttendanceCounts(rows), [rows]);
  const canAdd = hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.Add');
  const canManageLock =
    context?.isAdmin === true &&
    context.canManageLock &&
    hasGrantedPermission(permissions, 'Students.Attendance.MarkAttendance.Delete');
  const editable =
    !!snapshot &&
    !!authoritative?.canMark &&
    canAdd &&
    !authoritative.isLocked &&
    authoritative.isExpected &&
    classRegister &&
    !contextQuery.isFetching &&
    !contextQuery.isError &&
    !rosterQuery.isError &&
    !busy &&
    !stale;
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
    ((snapshot?.isSubmitted && snapshot.policy.sameDayCorrectionRequiresReason !== false) ||
      leaveConflict);
  const reasonValid = !reasonRequired || Boolean(correctionReason.trim());
  const canSave = editable && dirty && reasonValid;
  const canSubmit =
    editable &&
    authoritative?.canSubmit === true &&
    counts.expected > 0 &&
    counts.unmarked === 0 &&
    !needsCreditCorrection &&
    (!snapshot?.isSubmitted || snapshot.needsReview || dirty) &&
    reasonValid;
  const canLock =
    canManageLock &&
    authoritative?.canLock === true &&
    snapshot?.isSubmitted &&
    !snapshot.needsReview &&
    !!snapshot.attendanceDayId &&
    counts.unmarked === 0 &&
    counts.expected > 0 &&
    !needsCreditCorrection &&
    !dirty &&
    !stale &&
    !busy &&
    classRegister &&
    !contextQuery.isFetching &&
    !contextQuery.isError &&
    !rosterQuery.isError;
  const updateRow = useCallback(
    (studentId: string, change: (row: AttendanceStudent) => AttendanceStudent) => {
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
    },
    [editable]
  );
  const pendingForBulk = rows.some(
    (row) =>
      row.isExpected &&
      row.status === AttendanceStatus.Pending &&
      !row.approvedLeaveId &&
      !row.requiresCorrectionApproval &&
      !row.needsCreditCorrection
  );
  const bulkPresent = () => {
    if (editable && pendingForBulk) {
      setRetryPayload(null);
      setRows(markRemainingPresent);
    }
  };
  const save = async (submit: boolean) => {
    if (!(submit ? canSubmit : canSave) || !snapshot || !year) return;
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
        students: rows,
        attendanceDayId: result.attendanceDayId || snapshot.attendanceDayId,
        revision: result.revision,
        isSubmitted: result.isSubmitted,
      });
      setRetryPayload(null);
      setCorrectionReason('');
      setDecision(null);
      shikshaMitraToast.success({
        message: submit ? 'Attendance submitted.' : 'Attendance draft saved.',
      });
      rosterQuery.refetch();
    } catch (problem) {
      const message = parseApiProblemDetail(problem).detail;
      setFailure(message);
      shikshaMitraToast.error({ message });
    }
  };
  const lockSubmitted = async () => {
    if (!canLock || !year) return;
    setFailure('');
    try {
      await lock({
        academicYearId: year.id,
        standardId: selection.standard,
        divisionId: selection.division,
        date: selection.date,
      }).unwrap();
      setDecision(null);
      shikshaMitraToast.success({ message: 'Attendance locked.' });
      rosterQuery.refetch();
    } catch (problem) {
      const message = parseApiProblemDetail(problem).detail;
      setFailure(message);
      shikshaMitraToast.error({ message });
    }
  };
  const refresh = () =>
    requestNavigation(() => {
      clearDraft();
      if (classRegister) rosterQuery.refetch();
      else if (validSelection) workspaceQuery.refetch();
    });
  const activeQuery = classRegister ? rosterQuery : workspaceQuery;
  const blockingError = contextQuery.isError || (validSelection && activeQuery.isError);
  const blockedStatus = (contextQuery.error || activeQuery.error) as
    { status?: number } | undefined;
  const denied = blockedStatus?.status === 401 || blockedStatus?.status === 403;
  const loadError = blockingError
    ? parseApiProblemDetail(contextQuery.error || activeQuery.error).detail
    : '';
  const columns = useMemo(
    () =>
      buildAttendanceColumns({
        editable,
        broad: !classRegister,
        submitted: snapshot?.isSubmitted || false,
        policy: snapshot?.policy,
        onChange: updateRow,
      }),
    [editable, classRegister, snapshot?.isSubmitted, snapshot?.policy, updateRow]
  );
  const className = options?.standards.find((s) => s.id === selection.standard)?.name;
  const divisionName = options?.divisions.find((d) => d.id === selection.division)?.name;
  const tableRows = useMemo(() => {
    if (!validSelection || blockingError) return [];
    return (classRegister ? rows : workspaceQuery.currentData?.items || []).map((row) => ({
      ...row,
      id: row.studentId,
      name: attendanceStudentName(row),
      grNumber: row.grNumber || String(row.grNo ?? ''),
      classDivision:
        [
          row.standardName || (classRegister ? className : ''),
          row.divisionName || (classRegister ? divisionName : ''),
        ]
          .filter(Boolean)
          .join(' / ') || '—',
      statusLabel: attendanceStatusLabel(row),
    }));
  }, [
    validSelection,
    blockingError,
    classRegister,
    rows,
    workspaceQuery.currentData,
    className,
    divisionName,
  ]);
  const classTable = useMemo(() => {
    const search = tableQuery.searchTerm.trim().toLocaleLowerCase();
    const filtered = search
      ? tableRows.filter((row) =>
          [row.name, row.grNumber, row.rollNo].some((value) =>
            String(value ?? '')
              .toLocaleLowerCase()
              .includes(search)
          )
        )
      : tableRows;
    const sort = tableQuery.sorts[0];
    const sorted = sort
      ? [...filtered].sort((a, b) => {
          const key =
            sort.column === 'grNumber' ? 'grNumber' : sort.column === 'rollNo' ? 'rollNo' : 'name';
          const compare = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, {
            numeric: true,
            sensitivity: 'base',
          });
          return (
            (sort.direction === 'desc' ? -compare : compare) ||
            a.studentId.localeCompare(b.studentId)
          );
        })
      : filtered;
    return {
      total: sorted.length,
      rows: sorted.slice(
        tableQuery.page * tableQuery.rowsPerPage,
        (tableQuery.page + 1) * tableQuery.rowsPerPage
      ),
    };
  }, [tableRows, tableQuery]);
  const hasFilters = Boolean(
    selection.board ||
    selection.medium ||
    selection.standard ||
    selection.division ||
    tableQuery.searchTerm
  );
  const clearFilters = () =>
    requestNavigation(() => {
      clearDraft();
      setSelection({ ...selection, board: '', medium: '', standard: '', division: '' });
      updateUrl({
        board: undefined,
        medium: undefined,
        class: undefined,
        division: undefined,
        organization: undefined,
        search: undefined,
        page: 0,
      });
    });
  const contextChanged =
    !academicYearOverride &&
    globalKey !==
      `${academicContext.year?.id}/${academicContext.board?.id}/${academicContext.medium?.id}`;
  const emptyMessage = !year
    ? 'Select an academic year to view attendance.'
    : context && !validDate
      ? selection.date > schoolToday
        ? 'Attendance cannot be taken for a future date.'
        : 'Choose a valid date within the academic year.'
      : context && !validFilters
        ? 'Choose filters available in your academic scope.'
        : context && !context.isAdmin && !context.assignedClasses.length
          ? 'No active class-teacher assignment is available for this academic year.'
          : hasFilters
            ? 'No students match your search or filters.'
            : 'No active students in this academic year.';
  const submitReason = !classRegister
    ? 'Choose one class and division to submit attendance.'
    : counts.unmarked
      ? `Mark all ${counts.unmarked} pending students in the full class register before submitting.`
      : !reasonValid
        ? 'Enter the required correction reason.'
        : '';
  return {
    year,
    selection,
    tableQuery,
    context,
    options,
    schoolToday,
    validSelection,
    classRegister,
    contextQuery,
    rosterQuery,
    workspaceQuery,
    snapshot,
    busy,
    saving,
    locking,
    retryPayload,
    editable,
    counts,
    stale,
    needsCreditCorrection,
    leaveConflict,
    reasonRequired,
    correctionReason,
    failure,
    decision,
    canSave,
    canSubmit,
    canLock,
    canManageLock,
    pendingForBulk,
    columns,
    tableRows,
    classTable,
    hasFilters,
    contextChanged,
    emptyMessage,
    submitReason,
    blockingError,
    denied,
    loadError,
    activeQuery,
    changeSelection,
    updateUrl,
    setDecision,
    save,
    lockSubmitted,
    refresh,
    clearFilters,
    switchContext,
    bulkPresent,
    confirmation,
    changeReason: (value: string) => {
      setCorrectionReason(value);
      setRetryPayload(null);
    },
  };
}
