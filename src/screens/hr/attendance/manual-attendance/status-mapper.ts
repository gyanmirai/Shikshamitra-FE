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

export const APPROVED_LEAVE_OVERRIDE_WARNING =
  'Approved leave exists for this date but attendance was manually overridden.';

export type ManualAttendanceUiStatus =
  (typeof MANUAL_ATTENDANCE_UI_STATUS)[keyof typeof MANUAL_ATTENDANCE_UI_STATUS];

export type ManualAttendanceStatusWire = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'NOT_MARKED';

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

export const applyManualAttendanceShiftTimes = <TRow extends ManualAttendanceShiftTimeRow>(
  rows: TRow[]
) => {
  let updated = 0;
  let skipped = 0;

  const nextRows = rows.map((row) => {
    if (
      row.captureMode !== 'manual_with_time' ||
      row.status !== MANUAL_ATTENDANCE_UI_STATUS.Present
    ) {
      return row;
    }

    const shiftStart = toAttendanceTableTimeValue(row.shiftStartTime);
    const shiftEnd = toAttendanceTableTimeValue(row.shiftEndTime);
    if (!shiftStart || !shiftEnd) {
      skipped += 1;
      return row;
    }

    updated += 1;
    return { ...row, timeIn: shiftStart, timeOut: shiftEnd };
  });

  return { rows: nextRows, updated, skipped };
};

export const toAttendanceTableTimeValue = (value?: string | null) => {
  if (!value) return '';

  // Preserve API clock time and avoid timezone shifts on ISO values.
  const isoTimeMatch = value.match(/T(\d{2}:\d{2}:\d{2})/);
  if (isoTimeMatch?.[1]) {
    const [hours, minutes] = isoTimeMatch[1].split(':');
    return `${hours}:${minutes}`;
  }

  const hhmmssMatch = value.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  if (hhmmssMatch?.[1]) return hhmmssMatch[1];

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
  const parsed = value.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  if (!parsed?.[1]) return null;
  return `${parsed[1]}:00`;
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
    row.status === MANUAL_ATTENDANCE_UI_STATUS.OnLeave ? row : { ...row, status }
  );

export const applyManualAttendanceRowStatus = <TRow extends ManualAttendanceSaveRow>(
  row: TRow,
  status: ManualAttendanceUiStatus
): TRow => {
  if (row.isApprovedLeave && status === MANUAL_ATTENDANCE_UI_STATUS.Pending) {
    return row;
  }

  if (
    row.isApprovedLeave &&
    status !== MANUAL_ATTENDANCE_UI_STATUS.OnLeave &&
    status !== MANUAL_ATTENDANCE_UI_STATUS.Pending
  ) {
    const warnings = row.warnings || [];
    return {
      ...row,
      status,
      warnings: warnings.includes(APPROVED_LEAVE_OVERRIDE_WARNING)
        ? warnings
        : [...warnings, APPROVED_LEAVE_OVERRIDE_WARNING],
    };
  }

  return { ...row, status };
};

export const buildManualAttendanceSaveEntries = (rows: ManualAttendanceSaveRow[]) =>
  rows.flatMap((row) => {
    const statusWire = mapManualAttendanceStatusToWire(row.status);
    const employeeId = row.employeeId || row.id;

    if (!employeeId || !statusWire || statusWire === 'NOT_MARKED') {
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
