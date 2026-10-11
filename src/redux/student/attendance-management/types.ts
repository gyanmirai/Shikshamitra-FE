export type AttendanceScope = { academicYearId: string; standardId?: string; divisionId?: string };
export type AttendanceRange = AttendanceScope & {
  startDate: string;
  endDate: string;
  skipCount?: number;
  maxResultCount?: number;
};
export type AttendanceMetrics = {
  studentId: string;
  enrollmentId: string;
  fullName: string;
  rollNo?: number | null;
  expectedDays: number;
  recordedDays: number;
  missingDays: number;
  presentCredit: number;
  percentage: number | null;
  isProvisional: boolean;
  lowAttendanceThreshold?: number;
  isBelowThreshold?: boolean;
};
export type AttendanceDaily = {
  date: string;
  status: number;
  late: boolean;
  halfDay: boolean;
  remarks?: string;
  expected: boolean;
  exclusionReason?: string;
};
export type AttendanceSummary = AttendanceMetrics & {
  academicYearId: string;
  daily: AttendanceDaily[];
};
export type AttendanceCorrection = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Applied';
  beforeStatus: number;
  requestedStatus: number;
  revision: string;
  academicYearId: string;
  standardId: string;
  divisionId: string;
  late: boolean;
  halfDay: boolean;
  remarks?: string;
  isCreditCorrection?: boolean;
  beforePresentCredit?: number | null;
  beforeDenominatorCredit?: number | null;
  requestedPresentCredit?: number | null;
  requestedDenominatorCredit?: number | null;
};
export function attendancePercentage(value: number | null): string {
  return value == null ? 'Not available' : `${value.toFixed(2)}%`;
}
export function attendanceStatus(status: number, expected = true): string {
  if (!expected) return 'Not expected';
  return status === 1 ? 'Present' : status === 2 ? 'Absent' : 'Unmarked';
}
export function isAttendanceDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function isAttendanceRange(start: string, end: string): boolean {
  return isAttendanceDate(start) && isAttendanceDate(end) && start <= end;
}
export function attendanceError(error: unknown, fallback: string): string {
  const value = error as {
    data?: { error?: { message?: string }; detail?: string; message?: string };
  };
  return value?.data?.error?.message || value?.data?.detail || value?.data?.message || fallback;
}
