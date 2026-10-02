import type { AttendanceStatus } from 'src/enums/student-attendace-status';

export interface AttendanceFilter {
  AcademicYearId: string;
  StandardId: string;
  DivisionId: string;
  Date: string;
}
export interface AttendancePolicySummary {
  sameDayCorrectionRequiresReason?: boolean;
  allowLate: boolean;
  allowHalfDay: boolean;
  halfDayCredit: number;
  lateCredit: number;
}
export interface AttendanceStudent {
  studentId: string;
  enrollmentId?: string | null;
  grNo?: number | string | null;
  rollNo?: number | string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  organizationName?: string;
  standardName?: string;
  divisionName?: string;
  status: AttendanceStatus;
  remarks?: string | null;
  late: boolean;
  halfDay: boolean;
  isExpected: boolean;
  requiresCorrectionApproval?: boolean;
  needsCreditCorrection?: boolean;
  notExpectedReason?: string | null;
  approvedLeaveId?: string | null;
  scheduleLabel?: string | null;
}
export interface AttendanceDay {
  attendanceDayId?: string | null;
  date: string;
  isLocked: boolean;
  isSubmitted: boolean;
  isPastMarkingCutoff?: boolean;
  needsReview?: boolean;
  revision?: string | null;
  rosterRevision: string;
  canMark: boolean;
  isExpected: boolean;
  notExpectedReason?: string | null;
  policy: AttendancePolicySummary;
  students: AttendanceStudent[];
}
export interface AttendanceScope {
  academicYearId: string;
  standardId: string;
  divisionId: string;
  date: string;
}
export interface AttendanceMark extends AttendanceScope {
  revision?: string | null;
  rosterRevision: string;
  submit: boolean;
  operationId: string;
  correctionReason?: string;
  entries: {
    studentId: string;
    enrollmentId?: string | null;
    status: AttendanceStatus;
    late: boolean;
    halfDay: boolean;
    remarks: string;
  }[];
}
export interface AttendanceMarkResult {
  revision?: string | null;
  isSubmitted: boolean;
}

export interface AttendanceCorrectionRequest extends AttendanceScope {
  studentId: string;
  status: AttendanceStatus;
  late: boolean;
  halfDay: boolean;
  remarks: string;
  reason: string;
  revision: string;
  operationId: string;
}
