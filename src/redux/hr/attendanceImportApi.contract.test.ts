import { it, expect, describe } from 'vitest';
import { AttendanceImportRunSource } from 'src/redux/hr/attendanceImportApi';
import { AttendanceImportBatchStatus } from 'src/enums/attendance-import-batch-statusType';

describe('attendance import enums', () => {
  it('matches backend numeric status values', () => {
    expect(AttendanceImportBatchStatus.Preview).toBe(1);
    expect(AttendanceImportBatchStatus.Confirmed).toBe(2);
    expect(AttendanceImportBatchStatus.BatchLocked).toBe(3);
    expect(AttendanceImportBatchStatus.PayrollLocked).toBe(4);
  });

  it('uses numeric run source values', () => {
    expect(AttendanceImportRunSource.FileUpload).toBe(0);
    expect(AttendanceImportRunSource.Integration).toBe(1);
    expect(AttendanceImportRunSource.Internal).toBe(2);
  });
});
