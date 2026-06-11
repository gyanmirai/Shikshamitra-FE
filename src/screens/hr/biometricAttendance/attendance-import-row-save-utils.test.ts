import { it, expect, describe } from 'vitest';
import { AttendanceRowStatus } from 'src/enums/attendance-row-status';
import { AttendanceImportRowStatusCode } from 'src/redux/hr/attendanceImportApi';

import {
  IMPORT_ROW_STATUS,
  mapImportRowStatusToUi,
  mapImportRowStatusToWire,
  isValidAttendanceImportTime,
  buildAttendanceImportRowsSaveEntries,
  hasCompleteValidAttendanceImportTimes,
  promotePendingImportRowToPresentWhenTimesComplete,
} from './attendance-import-row-save-utils';

describe('attendance import row save utils', () => {
  const buildRow = (overrides: Record<string, any> = {}) => ({
    id: 'row-1',
    employeeId: 'employee-1',
    rowNumber: 1,
    action: 'replace',
    attendanceDate: '11-04-2026',
    employeeCode: 'EMP001',
    employeeName: 'A User',
    contactNo: '',
    timeIn: '',
    timeOut: '',
    status: 'Pending',
    statusCode: null,
    remarks: '',
    errors: [],
    warnings: [],
    attendanceStatus: IMPORT_ROW_STATUS.Pending,
    ...overrides,
  });

  it('maps backend status codes and text to editable UI statuses', () => {
    expect(mapImportRowStatusToUi(AttendanceImportRowStatusCode.Present, null)).toBe(
      AttendanceRowStatus.Present
    );
    expect(mapImportRowStatusToUi(AttendanceImportRowStatusCode.Absent, null)).toBe(
      AttendanceRowStatus.Absent
    );
    expect(mapImportRowStatusToUi(AttendanceImportRowStatusCode.HalfDay, null)).toBe(
      AttendanceRowStatus.HalfDay
    );
    expect(mapImportRowStatusToUi(null, 'FullDayLeave')).toBe(AttendanceRowStatus.Absent);
    expect(mapImportRowStatusToUi(null, 'Half Day Leave')).toBe(AttendanceRowStatus.HalfDay);
    expect(mapImportRowStatusToUi(null, 'Pending')).toBe(IMPORT_ROW_STATUS.Pending);
    expect(mapImportRowStatusToUi(null, 'mystery')).toBe(IMPORT_ROW_STATUS.Pending);
  });

  it('maps editable UI statuses to canonical save wire values', () => {
    expect(mapImportRowStatusToWire(IMPORT_ROW_STATUS.Present)).toBe('Present');
    expect(mapImportRowStatusToWire(IMPORT_ROW_STATUS.Absent)).toBe('Absent');
    expect(mapImportRowStatusToWire(IMPORT_ROW_STATUS.HalfDay)).toBe('HalfDay');
    expect(mapImportRowStatusToWire(IMPORT_ROW_STATUS.Pending)).toBeNull();
  });

  it('validates complete HH:mm punch times before auto-promotion', () => {
    expect(isValidAttendanceImportTime('07:00')).toBe(true);
    expect(isValidAttendanceImportTime('23:59')).toBe(true);
    expect(isValidAttendanceImportTime('7:00')).toBe(false);
    expect(isValidAttendanceImportTime('24:00')).toBe(false);
    expect(isValidAttendanceImportTime('07:60')).toBe(false);

    expect(hasCompleteValidAttendanceImportTimes(buildRow({ timeIn: '07:00' }))).toBe(false);
    expect(
      hasCompleteValidAttendanceImportTimes(buildRow({ timeIn: '07:00', timeOut: '17:30' }))
    ).toBe(true);
  });

  it('keeps a pending row pending when only one valid punch exists', () => {
    const row = promotePendingImportRowToPresentWhenTimesComplete(
      buildRow({ timeIn: '07:00', timeOut: '' })
    );

    expect(row.attendanceStatus).toBe(IMPORT_ROW_STATUS.Pending);
    expect(buildAttendanceImportRowsSaveEntries([row])).toEqual([]);
  });

  it('promotes a pending row with valid in and out times to Present for save', () => {
    const row = promotePendingImportRowToPresentWhenTimesComplete(
      buildRow({ timeIn: '07:00', timeOut: '17:30', remarks: 'Corrected punches' })
    );

    expect(row.attendanceStatus).toBe(IMPORT_ROW_STATUS.Present);
    expect(buildAttendanceImportRowsSaveEntries([row])).toEqual([
      {
        rowId: 'row-1',
        employeeId: 'employee-1',
        attendanceDate: '11-04-2026',
        statusWire: 'Present',
        inTime: '07:00',
        outTime: '17:30',
        remarks: 'Corrected punches',
      },
    ]);
  });

  it('does not overwrite explicit non-pending attendance choices when times are complete', () => {
    const absentRow = promotePendingImportRowToPresentWhenTimesComplete(
      buildRow({
        timeIn: '07:00',
        timeOut: '17:30',
        attendanceStatus: IMPORT_ROW_STATUS.Absent,
      })
    );
    const halfDayRow = promotePendingImportRowToPresentWhenTimesComplete(
      buildRow({
        timeIn: '07:00',
        timeOut: '17:30',
        attendanceStatus: IMPORT_ROW_STATUS.HalfDay,
      })
    );

    expect(absentRow.attendanceStatus).toBe(IMPORT_ROW_STATUS.Absent);
    expect(halfDayRow.attendanceStatus).toBe(IMPORT_ROW_STATUS.HalfDay);
  });

  it('builds a row-scoped save payload when a row is marked absent', () => {
    const entries = buildAttendanceImportRowsSaveEntries([
      buildRow({
        timeIn: '09:00',
        timeOut: '17:30',
        status: 'Present',
        statusCode: AttendanceImportRowStatusCode.Present,
        remarks: 'Changed manually',
        attendanceStatus: IMPORT_ROW_STATUS.Absent,
      }),
      buildRow({
        id: 'row-2',
        employeeId: 'employee-2',
        rowNumber: 2,
        employeeCode: 'EMP002',
        employeeName: 'Pending User',
      }),
    ]);

    expect(entries).toEqual([
      {
        rowId: 'row-1',
        employeeId: 'employee-1',
        attendanceDate: '11-04-2026',
        statusWire: 'Absent',
        inTime: '09:00',
        outTime: '17:30',
        remarks: 'Changed manually',
      },
    ]);
  });
});
