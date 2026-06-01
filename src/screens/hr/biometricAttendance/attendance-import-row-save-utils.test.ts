import { it, expect, describe } from 'vitest';
import { AttendanceRowStatus } from 'src/enums/attendance-row-status';
import { AttendanceImportRowStatusCode } from 'src/redux/hr/attendanceImportApi';

import {
  IMPORT_ROW_STATUS,
  mapImportRowStatusToUi,
  mapImportRowStatusToWire,
  buildAttendanceImportRowsSaveEntries,
} from './attendance-import-row-save-utils';

describe('attendance import row save utils', () => {
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

  it('builds a row-scoped save payload when a row is marked absent', () => {
    const entries = buildAttendanceImportRowsSaveEntries([
      {
        id: 'row-1',
        employeeId: 'employee-1',
        rowNumber: 1,
        action: 'replace',
        attendanceDate: '11-04-2026',
        employeeCode: 'EMP001',
        employeeName: 'A User',
        contactNo: '',
        timeIn: '09:00',
        timeOut: '17:30',
        status: 'Present',
        statusCode: AttendanceImportRowStatusCode.Present,
        remarks: 'Changed manually',
        errors: [],
        warnings: [],
        attendanceStatus: IMPORT_ROW_STATUS.Absent,
      },
      {
        id: 'row-2',
        employeeId: 'employee-2',
        rowNumber: 2,
        action: 'replace',
        attendanceDate: '11-04-2026',
        employeeCode: 'EMP002',
        employeeName: 'Pending User',
        contactNo: '',
        timeIn: '',
        timeOut: '',
        status: 'Pending',
        statusCode: null,
        remarks: '',
        errors: [],
        warnings: [],
        attendanceStatus: IMPORT_ROW_STATUS.Pending,
      },
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
