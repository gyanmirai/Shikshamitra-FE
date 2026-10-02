import { it, expect, describe } from 'vitest';

import {
  attendanceStatus,
  isAttendanceDate,
  isAttendanceRange,
  attendancePercentage,
} from './types';

describe('attendance display and date boundaries', () => {
  it('keeps a missing percentage distinguishable from recorded zero attendance', () => {
    expect(attendancePercentage(null)).toBe('Not available');
    expect(attendancePercentage(0)).toBe('0.00%');
    expect(attendancePercentage((17 / 18) * 100)).toBe('94.44%');
  });
  it('never presents unmarked or not-expected days as absence', () => {
    expect(attendanceStatus(0)).toBe('Unmarked');
    expect(attendanceStatus(2, false)).toBe('Not expected');
    expect(attendanceStatus(1)).toBe('Present');
  });
  it('rejects rolled-over and localized dates while permitting leap days', () => {
    expect(isAttendanceDate('2026-02-30')).toBe(false);
    expect(isAttendanceDate('2026-02-29')).toBe(false);
    expect(isAttendanceDate('2028-02-29')).toBe(true);
    expect(isAttendanceDate('01/10/2026')).toBe(false);
    expect(isAttendanceDate('2026-10-01T00:00:00')).toBe(false);
  });
  it('rejects reversed ranges before querying attendance', () => {
    expect(isAttendanceRange('2026-10-02', '2026-10-01')).toBe(false);
    expect(isAttendanceRange('2026-10-01', '2026-10-01')).toBe(true);
    expect(isAttendanceRange('2026-02-30', '2026-03-02')).toBe(false);
  });
});
