export enum TimetableReportTitle {
  ClassWiseTimetableReport,
  TeacherWiseTimetableReport,
  RoomUtilizationReport,
  SubjectWiseTimetableDistribution,
  FreePeriodsReport,
  TimetableChangeLogReport,
}

export const TimetableReportTitleOptions = [
  {
    name: TimetableReportTitle.ClassWiseTimetableReport,
    label: 'Class-wise Timetable Report',
  },
  {
    name: TimetableReportTitle.TeacherWiseTimetableReport,
    label: 'Teacher-wise Timetable Report',
  },
  {
    name: TimetableReportTitle.RoomUtilizationReport,
    label: 'Room Utilization Report',
  },
  {
    name: TimetableReportTitle.SubjectWiseTimetableDistribution,
    label: 'Subject-wise Timetable Distribution',
  },
  {
    name: TimetableReportTitle.FreePeriodsReport,
    label: 'Free Periods Report',
  },
  {
    name: TimetableReportTitle.TimetableChangeLogReport,
    label: 'Timetable Change Log Report',
  },
];
