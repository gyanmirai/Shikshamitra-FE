import { it, expect, describe } from 'vitest';
import { AttendanceImportBatchStatus } from 'src/enums/attendance-import-batch-statusType';
import {
  AttendanceImportRunSource,
  AttendanceImportRowStatusCode,
  buildSaveAttendanceImportRowsQuery,
} from 'src/redux/hr/attendanceImportApi';

describe('attendance import enums', () => {
  it('matches backend numeric status values', () => {
    expect(AttendanceImportBatchStatus.Preview).toBe(1);
    expect(AttendanceImportBatchStatus.Confirmed).toBe(2);
    expect(AttendanceImportBatchStatus['Batch Locked']).toBe(3);
    expect(AttendanceImportBatchStatus['Payroll Locked']).toBe(4);
  });

  it('uses numeric run source values', () => {
    expect(AttendanceImportRunSource.FileUpload).toBe(0);
    expect(AttendanceImportRunSource.Integration).toBe(1);
    expect(AttendanceImportRunSource.Internal).toBe(2);
  });

  it('uses numeric row status code values', () => {
    expect(AttendanceImportRowStatusCode.Present).toBe(0);
    expect(AttendanceImportRowStatusCode.Absent).toBe(1);
    expect(AttendanceImportRowStatusCode.HalfDay).toBe(2);
  });

  it('posts import row edits to the batch-scoped save endpoint', () => {
    const request = buildSaveAttendanceImportRowsQuery({
      importId: 'import-1',
      entries: [
        {
          rowId: 'row-1',
          employeeId: 'employee-1',
          attendanceDate: '11-04-2026',
          statusWire: 'Absent',
        },
      ],
    });

    expect(request).toEqual({
      url: '/hr/attendance/automated-runs/import-1/rows/save',
      method: 'POST',
      body: {
        entries: [
          {
            rowId: 'row-1',
            employeeId: 'employee-1',
            attendanceDate: '11-04-2026',
            statusWire: 'Absent',
          },
        ],
      },
    });
  });
});
