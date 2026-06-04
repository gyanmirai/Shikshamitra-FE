import { it, expect, describe } from 'vitest';
import {
  isRegisterMissingPunch,
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

  it('does not mark manual-status present rows without punches as missing punch', () => {
    expect(
      isRegisterMissingPunch({
        status: 'Present',
        captureMode: 'manual_status',
        inTime: null,
        outTime: null,
      })
    ).toBe(false);
  });

  it('marks manual-with-time and integrated present rows with missing punches', () => {
    expect(
      isRegisterMissingPunch({
        status: 'Present',
        captureMode: 'manual_with_time',
        inTime: '2026-04-11T09:00:00Z',
        outTime: null,
      })
    ).toBe(true);
    expect(
      isRegisterMissingPunch({
        status: 'Present',
        captureMode: 'integrated',
        inTime: null,
        outTime: '2026-04-11T17:30:00Z',
      })
    ).toBe(true);
  });

  it('does not mark absent or half-day rows as missing punch', () => {
    expect(
      isRegisterMissingPunch({
        status: 'Absent',
        captureMode: 'integrated',
        inTime: null,
        outTime: null,
      })
    ).toBe(false);
    expect(
      isRegisterMissingPunch({
        status: 'HalfDay',
        captureMode: 'manual_with_time',
        inTime: null,
        outTime: null,
      })
    ).toBe(false);
  });
});
