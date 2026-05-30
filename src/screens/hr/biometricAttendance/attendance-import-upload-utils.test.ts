import { it, expect, describe } from 'vitest';

import {
  isSupportedAttendanceImportFile,
  normalizeAttendanceImportFileName,
  hasDuplicateAttendanceImportFileName,
} from './attendance-import-upload-utils';

describe('attendance import upload utils', () => {
  it('normalizes filenames for duplicate comparison', () => {
    expect(normalizeAttendanceImportFileName('  April_Attendance.XLSX  ')).toBe(
      'april_attendance.xlsx'
    );
  });

  it('accepts csv, xls, and xlsx files with known or empty browser mime types', () => {
    expect(isSupportedAttendanceImportFile({ name: 'attendance.csv', type: 'text/csv' })).toBe(
      true
    );
    expect(
      isSupportedAttendanceImportFile({
        name: 'attendance.xls',
        type: 'application/vnd.ms-excel',
      })
    ).toBe(true);
    expect(
      isSupportedAttendanceImportFile({
        name: 'attendance.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    ).toBe(true);
    expect(isSupportedAttendanceImportFile({ name: 'attendance.xlsx', type: '' })).toBe(true);
  });

  it('rejects unsupported extensions and mismatched mime types', () => {
    expect(
      isSupportedAttendanceImportFile({ name: 'attendance.pdf', type: 'application/pdf' })
    ).toBe(false);
    expect(
      isSupportedAttendanceImportFile({ name: 'attendance.csv', type: 'application/pdf' })
    ).toBe(false);
  });

  it('detects duplicate visible-history filenames by exact normalized name', () => {
    const imports = [{ fileName: ' April_Attendance.xlsx ' }, { fileName: 'march.csv' }];

    expect(hasDuplicateAttendanceImportFileName('april_attendance.XLSX', imports)).toBe(true);
    expect(hasDuplicateAttendanceImportFileName('attendance_april.xlsx', imports)).toBe(false);
  });
});
