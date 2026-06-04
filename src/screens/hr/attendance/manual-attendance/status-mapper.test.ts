import { it, expect, describe } from 'vitest';
import {
  TAKE_ATTENDANCE_STATUS,
  MANUAL_ATTENDANCE_UI_STATUS,
  mapTakeAttendanceStatusToUi,
  mapManualAttendanceStatusToWire,
  applyManualAttendanceShiftTimes,
  buildManualAttendanceSaveEntries,
  MANUAL_ATTENDANCE_STATUS_FILTER_OPTIONS,
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

  it('maps UI statuses to backend wire statuses', () => {
    expect(mapManualAttendanceStatusToWire(MANUAL_ATTENDANCE_UI_STATUS.Present)).toBe('PRESENT');
    expect(mapManualAttendanceStatusToWire(MANUAL_ATTENDANCE_UI_STATUS.HalfDay)).toBe('HALF_DAY');
    expect(mapManualAttendanceStatusToWire(MANUAL_ATTENDANCE_UI_STATUS.Absent)).toBe('ABSENT');
  });

  it('does not send pending rows to the save endpoint', () => {
    const entries = buildManualAttendanceSaveEntries([
      { employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.Present },
      { employeeId: 'employee-2', status: MANUAL_ATTENDANCE_UI_STATUS.Pending },
    ]);

    expect(entries).toEqual([
      {
        employeeId: 'employee-1',
        statusWire: 'PRESENT',
        inTime: null,
        outTime: null,
        remarks: '',
      },
    ]);
  });

  it('strips times from manual status rows before saving', () => {
    const entries = buildManualAttendanceSaveEntries([
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_status',
        timeIn: '09:00',
        timeOut: '17:00',
      },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_with_time',
        timeIn: '09:00',
        timeOut: '17:00',
      },
    ]);

    expect(entries).toEqual([
      {
        employeeId: 'employee-1',
        statusWire: 'PRESENT',
        inTime: null,
        outTime: null,
        remarks: '',
      },
      {
        employeeId: 'employee-2',
        statusWire: 'PRESENT',
        inTime: '09:00:00',
        outTime: '17:00:00',
        remarks: '',
      },
    ]);
  });

  it('applies shift time only to manual-with-time present rows', () => {
    const result = applyManualAttendanceShiftTimes([
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_with_time',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
      },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
        captureMode: 'manual_with_time',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
      },
      {
        employeeId: 'employee-3',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_status',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
      },
      {
        employeeId: 'employee-4',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'integrated',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
      },
      {
        employeeId: 'employee-5',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_with_time',
        shiftStartTime: null,
        shiftEndTime: '17:00:00',
      },
    ]);

    expect(result.updated).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.rows[0]).toMatchObject({ timeIn: '09:00', timeOut: '17:00' });
    expect(result.rows[1]).not.toHaveProperty('timeIn');
    expect(result.rows[2]).not.toHaveProperty('timeIn');
    expect(result.rows[3]).not.toHaveProperty('timeIn');
    expect(result.rows[4]).not.toHaveProperty('timeIn');
  });

  it('exposes status filter options for locked read-only attendance tables', () => {
    expect(MANUAL_ATTENDANCE_STATUS_FILTER_OPTIONS).toEqual([
      { label: 'Present', value: MANUAL_ATTENDANCE_UI_STATUS.Present },
      { label: 'Half Day', value: MANUAL_ATTENDANCE_UI_STATUS.HalfDay },
      { label: 'Absent', value: MANUAL_ATTENDANCE_UI_STATUS.Absent },
      { label: 'Pending', value: MANUAL_ATTENDANCE_UI_STATUS.Pending },
    ]);
  });
});
