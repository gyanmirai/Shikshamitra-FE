import { it, expect, describe } from 'vitest';
import {
  TAKE_ATTENDANCE_STATUS,
  MANUAL_ATTENDANCE_UI_STATUS,
  mapTakeAttendanceStatusToUi,
  getDirtyManualAttendanceRows,
  applyManualAttendanceRowStatus,
  mapManualAttendanceStatusToWire,
  applyManualAttendanceShiftTimes,
  applyManualAttendanceBulkStatus,
  APPROVED_LEAVE_OVERRIDE_WARNING,
  getTimeBasedAttendanceTimeIssues,
  buildManualAttendanceSaveEntries,
  isManualAttendanceBulkStatusDisabled,
  mapManualAttendanceDayResponseToRows,
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
    expect(mapTakeAttendanceStatusToUi(TAKE_ATTENDANCE_STATUS.OnLeave)).toBe(
      MANUAL_ATTENDANCE_UI_STATUS.OnLeave
    );
  });

  it('maps unknown status to pending', () => {
    expect(mapTakeAttendanceStatusToUi(undefined)).toBe(MANUAL_ATTENDANCE_UI_STATUS.Pending);
    expect(mapTakeAttendanceStatusToUi(999)).toBe(MANUAL_ATTENDANCE_UI_STATUS.Pending);
  });

  it('maps a refetched backend half-day row into clean grid state after save', () => {
    const rows = mapManualAttendanceDayResponseToRows({
      isDayLocked: false,
      captureMode: 'manual_with_time',
      items: [
        {
          employeeId: 'employee-1',
          fullName: 'Akshay Patel',
          employeeCode: 'EMP-1',
          inTime: '2026-06-04T08:35:00Z',
          outTime: '2026-06-04T17:30:00Z',
          shiftStartTime: '08:00:00',
          shiftEndTime: '17:30:00',
          status: TAKE_ATTENDANCE_STATUS.HalfDay,
          warnings: ['Auto-marked Half Day: late arrival exceeded grace time.'],
        },
      ],
    });

    expect(rows).toEqual([
      expect.objectContaining({
        id: 'employee-1',
        employeeId: 'employee-1',
        fullName: 'Akshay Patel',
        timeIn: '08:35',
        timeOut: '17:30',
        captureMode: 'manual_with_time',
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        warnings: ['Auto-marked Half Day: late arrival exceeded grace time.'],
      }),
    ]);
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

  it('does not send unchanged on-leave rows to the save endpoint', () => {
    const entries = buildManualAttendanceSaveEntries([
      { employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.OnLeave },
    ]);

    expect(entries).toEqual([]);
  });

  it('maps on-leave rows to approved-leave source when source is omitted', () => {
    const rows = mapManualAttendanceDayResponseToRows({
      items: [
        {
          employeeId: 'employee-1',
          status: TAKE_ATTENDANCE_STATUS.OnLeave,
          isApprovedLeave: true,
        },
      ],
    });

    expect(rows[0]).toMatchObject({
      status: MANUAL_ATTENDANCE_UI_STATUS.OnLeave,
      source: 'approved_leave',
    });
  });

  it('sends manually changed on-leave rows with normal save wires', () => {
    const entries = buildManualAttendanceSaveEntries([
      { employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.Present },
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

  it('preserves on-leave rows when applying a bulk status', () => {
    const rows = applyManualAttendanceBulkStatus(
      [
        { employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.OnLeave },
        { employeeId: 'employee-2', status: MANUAL_ATTENDANCE_UI_STATUS.Pending },
      ],
      MANUAL_ATTENDANCE_UI_STATUS.Absent
    );

    expect(rows).toEqual([
      { employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.OnLeave },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
      },
    ]);
  });

  it.each([
    MANUAL_ATTENDANCE_UI_STATUS.OnLeave,
    MANUAL_ATTENDANCE_UI_STATUS.Present,
    MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
    MANUAL_ATTENDANCE_UI_STATUS.Absent,
  ])('keeps approved-leave %s rows unchanged when applying pending', (status) => {
    const row = applyManualAttendanceRowStatus(
      {
        employeeId: 'employee-1',
        status,
        isApprovedLeave: true,
      },
      MANUAL_ATTENDANCE_UI_STATUS.Pending
    );

    expect(row).toEqual({
      employeeId: 'employee-1',
      status,
      isApprovedLeave: true,
    });
  });

  it('allows non-approved rows to move to pending', () => {
    const row = applyManualAttendanceRowStatus(
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
      },
      MANUAL_ATTENDANCE_UI_STATUS.Pending
    );

    expect(row).toEqual({
      employeeId: 'employee-1',
      status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
    });
  });

  it('fills full shift times when applying present to time-based rows', () => {
    const rows = applyManualAttendanceBulkStatus(
      [
        {
          employeeId: 'employee-1',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'manual_with_time',
          shiftStartTime: '09:00:00',
          shiftEndTime: '17:00:00',
        },
        {
          employeeId: 'employee-2',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'integrated',
          shiftStartTime: '08:30:00',
          shiftEndTime: '16:30:00',
        },
        {
          employeeId: 'employee-3',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'manual_status',
          shiftStartTime: '10:00:00',
          shiftEndTime: '18:00:00',
        },
      ],
      MANUAL_ATTENDANCE_UI_STATUS.Present
    );

    expect(rows).toEqual([
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        timeIn: '09:00',
        timeOut: '17:00',
      }),
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        timeIn: '08:30',
        timeOut: '16:30',
      }),
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        timeIn: '',
        timeOut: '',
      }),
    ]);
  });

  it('fills first-half shift times when applying half day to time-based rows', () => {
    const rows = applyManualAttendanceBulkStatus(
      [
        {
          employeeId: 'employee-1',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'manual_with_time',
          shiftStartTime: '09:00:00',
          shiftEndTime: '17:00:00',
        },
        {
          employeeId: 'employee-2',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'integrated',
          shiftStartTime: '08:30:00',
          shiftEndTime: '16:30:00',
        },
      ],
      MANUAL_ATTENDANCE_UI_STATUS.HalfDay
    );

    expect(rows).toEqual([
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        timeIn: '09:00',
        timeOut: '13:00',
      }),
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        timeIn: '08:30',
        timeOut: '12:30',
      }),
    ]);
  });

  it('does not auto-fill overnight or invalid shift ranges', () => {
    const rows = applyManualAttendanceBulkStatus(
      [
        {
          employeeId: 'employee-1',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'manual_with_time',
          shiftStartTime: '22:00:00',
          shiftEndTime: '06:00:00',
        },
        {
          employeeId: 'employee-2',
          status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
          captureMode: 'integrated',
          shiftStartTime: '09:00:00',
          shiftEndTime: '09:00:00',
        },
      ],
      MANUAL_ATTENDANCE_UI_STATUS.HalfDay
    );

    expect(rows).toEqual([
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        timeIn: '',
        timeOut: '',
      }),
      expect.objectContaining({
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        timeIn: '',
        timeOut: '',
      }),
    ]);
  });

  it('applies single-row status defaults and clears absent times', () => {
    const present = applyManualAttendanceRowStatus(
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Pending,
        captureMode: 'manual_with_time',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
      },
      MANUAL_ATTENDANCE_UI_STATUS.Present
    );
    const absent = applyManualAttendanceRowStatus(
      {
        ...present,
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
      },
      MANUAL_ATTENDANCE_UI_STATUS.Absent
    );

    expect(present).toMatchObject({ timeIn: '09:00', timeOut: '17:00' });
    expect(absent).toMatchObject({
      status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
      timeIn: '',
      timeOut: '',
    });
  });

  it('adds one approved-leave override warning for manual statuses', () => {
    const row = applyManualAttendanceRowStatus(
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.OnLeave,
        isApprovedLeave: true,
        warnings: [APPROVED_LEAVE_OVERRIDE_WARNING],
      },
      MANUAL_ATTENDANCE_UI_STATUS.Present
    );

    expect(row.status).toBe(MANUAL_ATTENDANCE_UI_STATUS.Present);
    expect(row.warnings).toEqual([APPROVED_LEAVE_OVERRIDE_WARNING]);
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

  it('applies shift time only to time-based present rows', () => {
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

    expect(result.updated).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.rows[0]).toMatchObject({ timeIn: '09:00', timeOut: '17:00' });
    expect(result.rows[1]).not.toHaveProperty('timeIn');
    expect(result.rows[2]).not.toHaveProperty('timeIn');
    expect(result.rows[3]).toMatchObject({ timeIn: '09:00', timeOut: '17:00' });
    expect(result.rows[4]).not.toHaveProperty('timeIn');
  });

  it('reports time-based present and half-day rows missing shift or attendance times', () => {
    const issues = getTimeBasedAttendanceTimeIssues([
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_with_time',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
        timeIn: '',
        timeOut: '',
      },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.HalfDay,
        captureMode: 'integrated',
        shiftStartTime: '17:00:00',
        shiftEndTime: '17:00:00',
        timeIn: '',
        timeOut: '',
      },
      {
        employeeId: 'employee-3',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_status',
      },
      {
        employeeId: 'employee-4',
        status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
        captureMode: 'manual_with_time',
      },
      {
        employeeId: 'employee-5',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'integrated',
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
        timeIn: '09:00',
        timeOut: '17:00',
      },
    ]);

    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({
      missingShiftTime: false,
      invalidShiftTime: false,
      missingAttendanceTime: true,
    });
    expect(issues[1]).toMatchObject({
      missingShiftTime: false,
      invalidShiftTime: true,
      missingAttendanceTime: true,
    });
  });

  it('returns only dirty manual attendance rows before saving', () => {
    const originalRows = [
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        remarks: '',
        timeIn: '09:00',
        timeOut: '17:00',
      },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
        remarks: 'Sick',
      },
    ];

    const dirtyRows = getDirtyManualAttendanceRows(
      [
        { ...originalRows[0] },
        { ...originalRows[1], remarks: 'Personal work' },
        { employeeId: 'employee-3', status: MANUAL_ATTENDANCE_UI_STATUS.Present },
      ],
      originalRows
    );

    expect(dirtyRows.map((row) => row.employeeId)).toEqual(['employee-2', 'employee-3']);
  });

  it('builds save entries from dirty rows only and ignores unchanged invalid page rows', () => {
    const originalRows = [
      {
        employeeId: 'employee-1',
        status: MANUAL_ATTENDANCE_UI_STATUS.Present,
        captureMode: 'manual_with_time' as const,
        shiftStartTime: '09:00:00',
        shiftEndTime: '17:00:00',
        timeIn: '',
        timeOut: '',
      },
      {
        employeeId: 'employee-2',
        status: MANUAL_ATTENDANCE_UI_STATUS.Absent,
        captureMode: 'manual_status' as const,
        remarks: '',
      },
    ];

    const dirtyRows = getDirtyManualAttendanceRows(
      [{ ...originalRows[0] }, { ...originalRows[1], remarks: 'Out' }],
      originalRows
    );

    expect(getTimeBasedAttendanceTimeIssues(dirtyRows)).toEqual([]);
    expect(buildManualAttendanceSaveEntries(dirtyRows)).toEqual([
      {
        employeeId: 'employee-2',
        statusWire: 'ABSENT',
        inTime: null,
        outTime: null,
        remarks: 'Out',
      },
    ]);
  });

  it('includes outside-academic-year in bulk status disabled checks', () => {
    const rows = [{ employeeId: 'employee-1', status: MANUAL_ATTENDANCE_UI_STATUS.Pending }];

    expect(
      isManualAttendanceBulkStatusDisabled(rows, MANUAL_ATTENDANCE_UI_STATUS.Present, {
        isOutsideAcademicYear: true,
      })
    ).toBe(true);
    expect(
      isManualAttendanceBulkStatusDisabled(rows, MANUAL_ATTENDANCE_UI_STATUS.Present, {
        isOutsideAcademicYear: false,
      })
    ).toBe(false);
  });

  it('exposes status filter options for locked read-only attendance tables', () => {
    expect(MANUAL_ATTENDANCE_STATUS_FILTER_OPTIONS).toEqual([
      { label: 'Present', value: MANUAL_ATTENDANCE_UI_STATUS.Present },
      { label: 'Half Day', value: MANUAL_ATTENDANCE_UI_STATUS.HalfDay },
      { label: 'Absent', value: MANUAL_ATTENDANCE_UI_STATUS.Absent },
      { label: 'On Leave', value: MANUAL_ATTENDANCE_UI_STATUS.OnLeave },
      { label: 'Pending', value: MANUAL_ATTENDANCE_UI_STATUS.Pending },
    ]);
  });
});
