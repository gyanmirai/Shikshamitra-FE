import type { AttendanceDashboardMetrics } from 'src/redux/student/attendance-dashboard-types';

export const attendancePercentageLabel = (percentage: number | null | undefined) =>
  percentage == null ? '—' : `${percentage}%`;

export const attendancePercentageColor = (percentage: number | null | undefined) => {
  if (percentage == null) return 'default' as const;
  return percentage >= 90 ? 'success' : percentage >= 75 ? 'warning' : 'error';
};

export const attendanceCompletionLabel = (metrics: AttendanceDashboardMetrics) =>
  `${metrics.recordedDays}/${metrics.expectedDays} expected student-days marked${metrics.isProvisional ? ' · Provisional' : ''}`;
