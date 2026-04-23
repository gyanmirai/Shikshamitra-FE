export const ATTENDANCE_TRACKING_STATUS = {
  Present: 0,
  Absent: 1,
  HalfDay: 2,
  RejectedLeave: 3,
} as const;

export const ATTENDANCE_TRACKING_FILTERS = [
  { value: 'PRESENT', label: 'Present', color: 'success' },
  { value: 'ABSENT', label: 'Absent', color: 'error' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'info' },
  { value: 'REJECTED_LEAVE', label: 'Rejected Leave', color: 'warning' },
] as const;

export const getAttendanceTrackingStatusLabel = (status?: number) => {
  switch (Number(status)) {
    case ATTENDANCE_TRACKING_STATUS.Present:
      return 'Present';
    case ATTENDANCE_TRACKING_STATUS.Absent:
      return 'Absent';
    case ATTENDANCE_TRACKING_STATUS.HalfDay:
      return 'Half Day';
    case ATTENDANCE_TRACKING_STATUS.RejectedLeave:
      return 'Rejected Leave';
    default:
      return 'Unknown';
  }
};
