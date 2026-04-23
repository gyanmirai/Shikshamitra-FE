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

export const mapTakeAttendanceStatusToUi = (status?: number): ManualAttendanceUiStatus => {
  if (status === TAKE_ATTENDANCE_STATUS.Present) return MANUAL_ATTENDANCE_UI_STATUS.Present;
  if (status === TAKE_ATTENDANCE_STATUS.HalfDay) return MANUAL_ATTENDANCE_UI_STATUS.HalfDay;
  if (status === TAKE_ATTENDANCE_STATUS.Absent) return MANUAL_ATTENDANCE_UI_STATUS.Absent;
  return MANUAL_ATTENDANCE_UI_STATUS.Pending;
};
