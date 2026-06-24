export const TAKE_ATTENDANCE_STATUS = {
  NotMarked: 0,
  Present: 1,
  Absent: 2,
  HalfDay: 3,
  OnLeave: 4,
} as const;

export const MANUAL_ATTENDANCE_UI_STATUS = {
  Present: 'Present',
  HalfDay: 'HalfDay',
  Absent: 'Absent',
  Pending: 'Pending',
  OnLeave: 'OnLeave',
} as const;

export const MANUAL_ATTENDANCE_STATUS_FILTER_OPTIONS = [
  { label: 'Present', value: MANUAL_ATTENDANCE_UI_STATUS.Present },
  { label: 'Half Day', value: MANUAL_ATTENDANCE_UI_STATUS.HalfDay },
  { label: 'Absent', value: MANUAL_ATTENDANCE_UI_STATUS.Absent },
  { label: 'On Leave', value: MANUAL_ATTENDANCE_UI_STATUS.OnLeave },
  { label: 'Pending', value: MANUAL_ATTENDANCE_UI_STATUS.Pending },
];

export type ManualAttendanceUiStatus =
  (typeof MANUAL_ATTENDANCE_UI_STATUS)[keyof typeof MANUAL_ATTENDANCE_UI_STATUS];

export type ManualAttendanceStatusWire = 'PRESENT' | 'HALF_DAY' | 'ABSENT';

export type ManualAttendanceSaveRow = {
  id?: string;
  employeeId?: string;
  status?: ManualAttendanceUiStatus | string;
  isApprovedLeave?: boolean;
  warnings?: string[];
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
};

export type ManualAttendanceShiftTimeRow = ManualAttendanceSaveRow & {
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
};

export type ManualAttendanceTimeValidationIssue<TRow extends ManualAttendanceShiftTimeRow> = {
  row: TRow;
  missingShiftTime: boolean;
  invalidShiftTime: boolean;
  missingAttendanceTime: boolean;
};

export type ManualAttendanceBulkStatusDisabledState = {
  isLocked?: boolean;
  isHoliday?: boolean;
  isFutureDate?: boolean;
  isOutsideAcademicYear?: boolean;
};

export type ManualAttendanceApiDayResponse = {
  isDayLocked?: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  holidayReason?: string | null;
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  items?: ManualAttendanceApiEmployeeRow[];
};

export type ManualAttendanceApiEmployeeRow = {
  employeeId: string;
  fullName?: string;
  employeeCode?: string;
  department?: string;
  dateIso?: string;
  inTime?: string | null;
  outTime?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  remarks?: string | null;
  warnings?: string[];
  errors?: string[];
  isHoliday?: boolean;
  holidayName?: string | null;
  holidayReason?: string | null;
  isApprovedLeave?: boolean;
  approvedLeaveId?: string | null;
  approvedLeaveKind?: string | null;
  approvedLeaveLabel?: string | null;
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  source?: string | null;
  status?: number;
};

export const mapManualAttendanceDayResponseToRows = (
  data?: ManualAttendanceApiDayResponse | null
) =>
  (data?.items ?? []).map((item) => ({
    id: item.employeeId,
    employeeId: item.employeeId,
    fullName: item.fullName,
    employeeCode: item.employeeCode,
    department: item.department,
    dateIso: item.dateIso,
    timeIn: toAttendanceTableTimeValue(item.inTime),
    timeOut: toAttendanceTableTimeValue(item.outTime),
    shiftStartTime: item.shiftStartTime,
    shiftEndTime: item.shiftEndTime,
    remarks: item.remarks || '',
    warnings: item.warnings || [],
    errors: item.errors || [],
    isHoliday: item.isHoliday || data?.isHoliday || false,
    holidayName: item.holidayName || data?.holidayName,
    holidayReason: item.holidayReason || data?.holidayReason,
    isApprovedLeave: item.isApprovedLeave || false,
    approvedLeaveId: item.approvedLeaveId,
    approvedLeaveKind: item.approvedLeaveKind,
    approvedLeaveLabel: item.approvedLeaveLabel,
    captureMode: item.captureMode || data?.captureMode || 'integrated',
    source:
      item.source || (item.status === TAKE_ATTENDANCE_STATUS.OnLeave ? 'approved_leave' : 'manual'),
    status: mapTakeAttendanceStatusToUi(item.status),
  }));

export const applyManualAttendanceStatusDefaults = <TRow extends ManualAttendanceShiftTimeRow>(
  row: TRow,
  status: ManualAttendanceUiStatus
): TRow => {
  if (row.captureMode === 'manual_status') {
    return { ...row, status, timeIn: '', timeOut: '' };
  }

  if (!isTimeBasedCaptureMode(row.captureMode)) {
    return { ...row, status };
  }

  if (status === MANUAL_ATTENDANCE_UI_STATUS.Pending) {
    return { ...row, status, timeIn: '', timeOut: '' };
  }

  if (status === MANUAL_ATTENDANCE_UI_STATUS.Absent) {
    return { ...row, status, timeIn: '00:00', timeOut: '00:00' };
  }

  const shiftStart = toAttendanceTableTimeValue(row.shiftStartTime);
  const shiftEnd = toAttendanceTableTimeValue(row.shiftEndTime);
  if (!isValidShiftRange(shiftStart, shiftEnd)) {
    return { ...row, status, timeIn: '', timeOut: '' };
  }

  if (status === MANUAL_ATTENDANCE_UI_STATUS.Present) {
    const shouldPreserveTimes = shouldPreserveAttendanceTimes(row, status);
    return {
      ...row,
      status,
      timeIn: shouldPreserveTimes
        ? toAttendanceTableTimeValue(row.timeIn) || shiftStart
        : shiftStart,
      timeOut: shouldPreserveTimes ? toAttendanceTableTimeValue(row.timeOut) || shiftEnd : shiftEnd,
    };
  }

  if (status === MANUAL_ATTENDANCE_UI_STATUS.HalfDay) {
    const midpoint = calculateShiftMidpoint(shiftStart, shiftEnd)!;
    const shouldPreserveTimes = shouldPreserveAttendanceTimes(row, status);
    return {
      ...row,
      status,
      timeIn: shouldPreserveTimes
        ? toAttendanceTableTimeValue(row.timeIn) || shiftStart
        : shiftStart,
      timeOut: shouldPreserveTimes ? toAttendanceTableTimeValue(row.timeOut) || midpoint : midpoint,
    };
  }

  return { ...row, status };
};

export const normalizeManualAttendanceRowsForSave = <TRow extends ManualAttendanceShiftTimeRow>(
  rows: TRow[]
): TRow[] =>
  rows.map((row) => {
    if (row.status === MANUAL_ATTENDANCE_UI_STATUS.Absent) {
      return applyManualAttendanceStatusDefaults(row, row.status);
    }

    if (
      (row.status === MANUAL_ATTENDANCE_UI_STATUS.Present ||
        row.status === MANUAL_ATTENDANCE_UI_STATUS.HalfDay) &&
      (!toAttendanceWireTime(row.timeIn) || !toAttendanceWireTime(row.timeOut))
    ) {
      const defaulted = applyManualAttendanceStatusDefaults(row, row.status);

      return {
        ...defaulted,
        timeIn: toAttendanceWireTime(row.timeIn) ? row.timeIn : defaulted.timeIn,
        timeOut: toAttendanceWireTime(row.timeOut) ? row.timeOut : defaulted.timeOut,
      };
    }

    return row;
  });

export const getTimeBasedAttendanceTimeIssues = <TRow extends ManualAttendanceShiftTimeRow>(
  rows: TRow[]
): ManualAttendanceTimeValidationIssue<TRow>[] =>
  rows.flatMap((row) => {
    const needsTime =
      isTimeBasedCaptureMode(row.captureMode) &&
      (row.status === MANUAL_ATTENDANCE_UI_STATUS.Present ||
        row.status === MANUAL_ATTENDANCE_UI_STATUS.HalfDay);

    if (!needsTime) {
      return [];
    }

    const shiftStart = toAttendanceTableTimeValue(row.shiftStartTime);
    const shiftEnd = toAttendanceTableTimeValue(row.shiftEndTime);
    const invalidShiftTime = Boolean(
      shiftStart && shiftEnd && !isValidShiftRange(shiftStart, shiftEnd)
    );
    const timeIn = toAttendanceWireTime(row.timeIn);
    const timeOut = toAttendanceWireTime(row.timeOut);
    const issue = {
      row,
      missingShiftTime: !shiftStart || !shiftEnd,
      invalidShiftTime,
      missingAttendanceTime: !timeIn || !timeOut,
    };

    return issue.missingShiftTime || issue.invalidShiftTime || issue.missingAttendanceTime
      ? [issue]
      : [];
  });

export const isManualAttendanceRowDirty = (
  row: ManualAttendanceSaveRow,
  original?: ManualAttendanceSaveRow | null
) => {
  if (!original) return true;

  return (
    row.status !== original.status ||
    (row.remarks || '') !== (original.remarks || '') ||
    (row.timeIn || '') !== (original.timeIn || '') ||
    (row.timeOut || '') !== (original.timeOut || '')
  );
};

export const getDirtyManualAttendanceRows = <TRow extends ManualAttendanceSaveRow>(
  rows: TRow[],
  originalRows: ManualAttendanceSaveRow[]
) =>
  rows.filter((row) => {
    const rowId = row.employeeId || row.id;
    const original = originalRows.find((item) => (item.employeeId || item.id) === rowId);
    return isManualAttendanceRowDirty(row, original);
  });

export const toAttendanceTableTimeValue = (value?: string | null) => {
  if (!value) return '';

  // Preserve API clock time and avoid timezone shifts on ISO values.
  const isoTimeMatch = value.match(/T(\d{2}:\d{2}:\d{2})/);
  if (isoTimeMatch?.[1]) {
    return toClockTimeValue(isoTimeMatch[1]);
  }

  const clockTime = toClockTimeValue(value);
  if (clockTime) return clockTime;

  const fallbackDate = new Date(value);
  if (!Number.isNaN(fallbackDate.getTime())) {
    const hours = `${fallbackDate.getHours()}`.padStart(2, '0');
    const minutes = `${fallbackDate.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return '';
};

export const toAttendanceWireTime = (value?: string | null) => {
  if (!value) return null;
  const clockTime = toClockTimeValue(value);
  return clockTime ? `${clockTime}:00` : null;
};

const isTimeBasedCaptureMode = (captureMode?: ManualAttendanceSaveRow['captureMode']) =>
  captureMode === 'manual_with_time' || captureMode === 'integrated';

const shouldPreserveAttendanceTimes = (
  row: ManualAttendanceShiftTimeRow,
  status: ManualAttendanceUiStatus
) =>
  hasPreservableAttendanceTime(row) ||
  row.status === status ||
  row.status === MANUAL_ATTENDANCE_UI_STATUS.Pending ||
  typeof row.status === 'undefined';

const hasPreservableAttendanceTime = (row: ManualAttendanceShiftTimeRow) => {
  if (row.status === MANUAL_ATTENDANCE_UI_STATUS.Absent) {
    return false;
  }

  const timeIn = toAttendanceTableTimeValue(row.timeIn);
  const timeOut = toAttendanceTableTimeValue(row.timeOut);
  return Boolean((timeIn && timeIn !== '00:00') || (timeOut && timeOut !== '00:00'));
};

const calculateShiftMidpoint = (shiftStart: string, shiftEnd: string) => {
  if (!isValidShiftRange(shiftStart, shiftEnd)) {
    return null;
  }

  const startMinutes = toMinutes(shiftStart);
  const endMinutes = toMinutes(shiftEnd);

  return toTimeValue(Math.floor((startMinutes + endMinutes) / 2));
};

const isValidShiftRange = (shiftStart: string, shiftEnd: string) =>
  Boolean(shiftStart && shiftEnd) &&
  Number.isFinite(toMinutes(shiftStart)) &&
  Number.isFinite(toMinutes(shiftEnd)) &&
  toMinutes(shiftEnd) > toMinutes(shiftStart);

const toMinutes = (value: string) => {
  const clockTime = toClockTimeValue(value);
  if (!clockTime) return Number.NaN;

  const [hours, minutes] = clockTime.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTimeValue = (minutesOfDay: number) => {
  const hours = `${Math.floor(minutesOfDay / 60)}`.padStart(2, '0');
  const minutes = `${minutesOfDay % 60}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const toClockTimeValue = (value: string) => {
  const parsed = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!parsed) return '';

  const [, hoursText, minutesText, secondsText = '00'] = parsed;
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);

  if (hours > 23 || minutes > 59 || seconds > 59) return '';

  return `${hoursText}:${minutesText}`;
};

export const mapTakeAttendanceStatusToUi = (status?: number): ManualAttendanceUiStatus => {
  if (status === TAKE_ATTENDANCE_STATUS.Present) return MANUAL_ATTENDANCE_UI_STATUS.Present;
  if (status === TAKE_ATTENDANCE_STATUS.HalfDay) return MANUAL_ATTENDANCE_UI_STATUS.HalfDay;
  if (status === TAKE_ATTENDANCE_STATUS.Absent) return MANUAL_ATTENDANCE_UI_STATUS.Absent;
  if (status === TAKE_ATTENDANCE_STATUS.OnLeave) return MANUAL_ATTENDANCE_UI_STATUS.OnLeave;
  return MANUAL_ATTENDANCE_UI_STATUS.Pending;
};

export const mapManualAttendanceStatusToWire = (
  status?: ManualAttendanceUiStatus | string
): ManualAttendanceStatusWire | null => {
  if (status === MANUAL_ATTENDANCE_UI_STATUS.Present) return 'PRESENT';
  if (status === MANUAL_ATTENDANCE_UI_STATUS.HalfDay) return 'HALF_DAY';
  if (status === MANUAL_ATTENDANCE_UI_STATUS.Absent) return 'ABSENT';
  return null;
};

export const applyManualAttendanceBulkStatus = <TRow extends ManualAttendanceSaveRow>(
  rows: TRow[],
  status: ManualAttendanceUiStatus
) =>
  rows.map((row) =>
    isLockedManualAttendanceRow(row) ? row : applyManualAttendanceStatusDefaults(row, status)
  );

export const isManualAttendanceBulkStatusDisabled = (
  rows: ManualAttendanceSaveRow[],
  status: ManualAttendanceUiStatus,
  state: ManualAttendanceBulkStatusDisabledState
) => {
  const mutableRows = rows.filter((row) => !isLockedManualAttendanceRow(row));

  return Boolean(
    state.isLocked ||
    state.isHoliday ||
    state.isFutureDate ||
    state.isOutsideAcademicYear ||
    mutableRows.length === 0 ||
    mutableRows.every((row) => row.status === status)
  );
};

export const applyManualAttendanceRowStatus = <TRow extends ManualAttendanceSaveRow>(
  row: TRow,
  status: ManualAttendanceUiStatus
): TRow => {
  if (row.isApprovedLeave) {
    return row;
  }

  return applyManualAttendanceStatusDefaults(row, status);
};

export const buildManualAttendanceSaveEntries = (rows: ManualAttendanceSaveRow[]) =>
  rows.flatMap((row) => {
    const statusWire = mapManualAttendanceStatusToWire(row.status);
    const employeeId = row.employeeId || row.id;

    if (row.isApprovedLeave || !employeeId || !statusWire) {
      return [];
    }

    return [
      {
        employeeId,
        statusWire,
        inTime: row.captureMode === 'manual_status' ? null : toAttendanceWireTime(row.timeIn),
        outTime: row.captureMode === 'manual_status' ? null : toAttendanceWireTime(row.timeOut),
        remarks: row.remarks || '',
      },
    ];
  });

const isLockedManualAttendanceRow = (row: ManualAttendanceSaveRow) =>
  Boolean(row.isApprovedLeave || row.status === MANUAL_ATTENDANCE_UI_STATUS.OnLeave);
