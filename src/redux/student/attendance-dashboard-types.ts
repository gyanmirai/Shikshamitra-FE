export type AttendanceDashboardMetrics = {
  expectedDays: number;
  recordedDays: number;
  missingDays: number;
  presentCredit: number;
  denominatorDays: number;
  completionPercentage: number | null;
  isProvisional: boolean;
};

export type AttendanceDashboardDivision = AttendanceDashboardMetrics & {
  divisionId: string | null;
  name: string;
  percentage: number | null;
};

export type AttendanceDashboardClass = AttendanceDashboardMetrics & {
  standardId: string | null;
  name: string;
  percentage: number | null;
  divisions: AttendanceDashboardDivision[];
};

export type StudentAttendanceDashboardSummary = AttendanceDashboardMetrics & {
  schoolAttendancePercentage: number | null;
  classes: AttendanceDashboardClass[];
};
