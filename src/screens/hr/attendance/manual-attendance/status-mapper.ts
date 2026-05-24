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

    if (!employeeId || !statusWire) {
      return [];
    }

    return [
      {
        employeeId,
        statusWire,
        inTime: row.timeIn || '',
        outTime: row.timeOut || '',
        remarks: row.remarks || '',
      },
    ];
  });
