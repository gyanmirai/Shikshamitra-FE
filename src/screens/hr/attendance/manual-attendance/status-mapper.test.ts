import { it, expect, describe } from 'vitest';
import {
  TAKE_ATTENDANCE_STATUS,
  MANUAL_ATTENDANCE_UI_STATUS,
  mapTakeAttendanceStatusToUi,
} from 'src/screens/hr/attendance/manual-attendance/status-mapper';

describe('manual attendance status mapper', () => {
  it('maps numeric API statuses to UI statuses', () => {
    expect(mapTakeAttendanceStatusToUi(TAKE_ATTENDANCE_STATUS.Present)).toBe(
      MANUAL_ATTENDANCE_UI_STATUS.Present
    );
    expect(mapTakeAttendanceStatusToUi(TAKE_ATTENDANCE_STATUS.HalfDay)).toBe(
      MANUAL_ATTENDANCE_UI_STATUS.HalfDay
    );
    expect(mapTakeAttendanceStatusToUi(TAKE_ATTENDANCE_STATUS.Absent)).toBe(
      MANUAL_ATTENDANCE_UI_STATUS.Absent
    );
  });

  it('maps unknown status to pending', () => {
    expect(mapTakeAttendanceStatusToUi(undefined)).toBe(MANUAL_ATTENDANCE_UI_STATUS.Pending);
    expect(mapTakeAttendanceStatusToUi(999)).toBe(MANUAL_ATTENDANCE_UI_STATUS.Pending);
  });
});
