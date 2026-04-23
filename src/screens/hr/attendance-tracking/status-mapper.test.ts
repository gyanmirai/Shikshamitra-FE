import { it, expect, describe } from 'vitest';
import {
  ATTENDANCE_TRACKING_STATUS,
  getAttendanceTrackingStatusLabel,
} from 'src/screens/hr/attendance-tracking/status-mapper';

describe('attendance tracking status mapper', () => {
  it('maps numeric statuses to UI labels', () => {
    expect(getAttendanceTrackingStatusLabel(ATTENDANCE_TRACKING_STATUS.Present)).toBe('Present');
    expect(getAttendanceTrackingStatusLabel(ATTENDANCE_TRACKING_STATUS.Absent)).toBe('Absent');
    expect(getAttendanceTrackingStatusLabel(ATTENDANCE_TRACKING_STATUS.HalfDay)).toBe('Half Day');
    expect(getAttendanceTrackingStatusLabel(ATTENDANCE_TRACKING_STATUS.RejectedLeave)).toBe(
      'Rejected Leave'
    );
  });

  it('returns Unknown for invalid status values', () => {
    expect(getAttendanceTrackingStatusLabel(-1)).toBe('Unknown');
  });
});
