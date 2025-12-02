export enum AttendanceReportTitle {
  StudentWiseAbsentDays,
  DailyStrengthAndGenderWiseSummary,
  DailyStrengthAndAttendanceSummary,
  MonthlyStrengthSummary,
  MonthlyStrengthAndAttendanceSummary,
  StudentAttendanceRegisterSmall,
  StudentAttendanceSheet,
  MonthlyStrengthSummaryDateRange,
  StudentWiseAbsentDaysDateRange,
}

export const AttendanceReportTitleOptions = [
  { name: AttendanceReportTitle.StudentWiseAbsentDays, label: 'Student Wise Absent Days' },
  {
    name: AttendanceReportTitle.DailyStrengthAndGenderWiseSummary,
    label: 'Daily Strength And Gender Wise Summary',
  },
  {
    name: AttendanceReportTitle.DailyStrengthAndAttendanceSummary,
    label: 'Daily Strength and Attendance Summary',
  },
  { name: AttendanceReportTitle.MonthlyStrengthSummary, label: 'Monthly Strength Summary' },
  {
    name: AttendanceReportTitle.MonthlyStrengthAndAttendanceSummary,
    label: 'Monthly Strength and Attendance Summary',
  },
  {
    name: AttendanceReportTitle.StudentAttendanceRegisterSmall,
    label: 'Student Attendance Register Small',
  },
  { name: AttendanceReportTitle.StudentAttendanceSheet, label: 'Student Attendance Sheet' },
  {
    name: AttendanceReportTitle.MonthlyStrengthSummaryDateRange,
    label: 'Monthly Strength Summary (Date Range)',
  },
  {
    name: AttendanceReportTitle.StudentWiseAbsentDaysDateRange,
    label: 'Student wise Absent Days (Date Range)',
  },
];
