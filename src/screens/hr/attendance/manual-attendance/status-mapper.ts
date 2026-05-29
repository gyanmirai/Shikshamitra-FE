export const TAKE_ATTENDANCE_STATUS = {
  NotMarked: 0,
  Present: 1,
  Absent: 2,
  HalfDay: 3,
} as const;

export const MANUAL_ATTENDANCE_UI_STATUS = {
  Present: 'Present',
  HalfDay: 'HalfDay',
  Absent: 'Absent',
  Pending: 'Pending',
} as const;

export const MANUAL_ATTENDANCE_STATUS_FILTER_OPTIONS = [
  { label: 'Present', value: MANUAL_ATTENDANCE_UI_STATUS.Present },
  { label: 'Half Day', value: MANUAL_ATTENDANCE_UI_STATUS.HalfDay },
  { label: 'Absent', value: MANUAL_ATTENDANCE_UI_STATUS.Absent },
  { label: 'Pending', value: MANUAL_ATTENDANCE_UI_STATUS.Pending },
];

export type ManualAttendanceUiStatus =
  (typeof MANUAL_ATTENDANCE_UI_STATUS)[keyof typeof MANUAL_ATTENDANCE_UI_STATUS];

export type ManualAttendanceStatusWire = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'NOT_MARKED';

export type ManualAttendanceSaveRow = {
  id?: string;
  employeeId?: string;
  status?: ManualAttendanceUiStatus | string;
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
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
        inTime: toAttendanceWireTime(row.timeIn),
        outTime: toAttendanceWireTime(row.timeOut),
        remarks: row.remarks || '',
      },
    ];
  });
