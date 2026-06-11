import { AttendanceRowStatus } from 'src/enums/attendance-row-status';
import {
  type AttendanceImportRow,
  AttendanceImportRowStatusCode,
  type AttendanceImportRowsSaveEntry,
} from 'src/redux/hr/attendanceImportApi';

export type ImportRowStatusType = AttendanceRowStatus | 'Pending';

export const IMPORT_ROW_STATUS = {
  Present: AttendanceRowStatus.Present,
  Absent: AttendanceRowStatus.Absent,
  HalfDay: AttendanceRowStatus.HalfDay,
  Pending: 'Pending' as const,
};

export type EditableAttendanceImportRow = AttendanceImportRow & {
  attendanceStatus: ImportRowStatusType;
};

export const isValidAttendanceImportTime = (value?: string | null): boolean =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());

export const hasCompleteValidAttendanceImportTimes = (
  row: Pick<EditableAttendanceImportRow, 'timeIn' | 'timeOut'>
): boolean => isValidAttendanceImportTime(row.timeIn) && isValidAttendanceImportTime(row.timeOut);

export const promotePendingImportRowToPresentWhenTimesComplete = <
  T extends Pick<EditableAttendanceImportRow, 'attendanceStatus' | 'timeIn' | 'timeOut'>,
>(
  row: T
): T =>
  row.attendanceStatus === IMPORT_ROW_STATUS.Pending && hasCompleteValidAttendanceImportTimes(row)
    ? { ...row, attendanceStatus: IMPORT_ROW_STATUS.Present }
    : row;

export const mapImportRowStatusToUi = (
  statusCode?: number | null,
  statusText?: string | null
): ImportRowStatusType => {
  if (statusCode === AttendanceImportRowStatusCode.Present) return IMPORT_ROW_STATUS.Present;
  if (statusCode === AttendanceImportRowStatusCode.Absent) return IMPORT_ROW_STATUS.Absent;
  if (statusCode === AttendanceImportRowStatusCode.HalfDay) return IMPORT_ROW_STATUS.HalfDay;

  const normalizedStatus = (statusText || '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, '');
  if (normalizedStatus === 'PRESENT') return IMPORT_ROW_STATUS.Present;
  if (normalizedStatus === 'ABSENT' || normalizedStatus === 'FULLDAYLEAVE') {
    return IMPORT_ROW_STATUS.Absent;
  }
  if (normalizedStatus === 'HALFDAY' || normalizedStatus === 'HALFDAYLEAVE') {
    return IMPORT_ROW_STATUS.HalfDay;
  }
  return IMPORT_ROW_STATUS.Pending;
};

export const mapImportRowStatusToWire = (status: ImportRowStatusType): string | null => {
  if (status === IMPORT_ROW_STATUS.Present) return 'Present';
  if (status === IMPORT_ROW_STATUS.Absent) return 'Absent';
  if (status === IMPORT_ROW_STATUS.HalfDay) return 'HalfDay';
  return null;
};

export const buildAttendanceImportRowsSaveEntries = (
  rows: EditableAttendanceImportRow[]
): AttendanceImportRowsSaveEntry[] => {
  const entries: AttendanceImportRowsSaveEntry[] = [];

  rows.forEach((row) => {
    const statusWire = mapImportRowStatusToWire(row.attendanceStatus);
    if (!statusWire || !row.employeeId) return;

    entries.push({
      rowId: row.id,
      employeeId: row.employeeId,
      attendanceDate: row.attendanceDate || '',
      statusWire,
      inTime: row.timeIn || undefined,
      outTime: row.timeOut || undefined,
      remarks: row.remarks || undefined,
    });
  });

  return entries;
};
