export enum HomeworkAssignmentAnalyticReportTitle {
  HomeworkLoadAnalysisReport,
  AssignmentLoadAnalysisReport,
  TeacherPerformanceInHomeworkEvaluationReport,
  StudentPerformanceTrendReport,
  ClasswiseOverallHomeworkAssignmentReport,
}

export const HomeworkAssignmentAnalyticReportApiTypeMap: Record<
  HomeworkAssignmentAnalyticReportTitle,
  string
> = {
  [HomeworkAssignmentAnalyticReportTitle.HomeworkLoadAnalysisReport]:
    'Homework Load Analysis Report',
  [HomeworkAssignmentAnalyticReportTitle.AssignmentLoadAnalysisReport]:
    'Assignment Load Analysis Report',
  [HomeworkAssignmentAnalyticReportTitle.TeacherPerformanceInHomeworkEvaluationReport]:
    'Teacher Performance in Homework Evaluation Report',
  [HomeworkAssignmentAnalyticReportTitle.StudentPerformanceTrendReport]:
    'Student Performance Trend Report',
  [HomeworkAssignmentAnalyticReportTitle.ClasswiseOverallHomeworkAssignmentReport]:
    'Class-wise Overall Homework & Assignment Report',
};

export const HomeworkAssignmentAnalyticReportTitleOptions = [
  {
    name: HomeworkAssignmentAnalyticReportTitle.HomeworkLoadAnalysisReport,
    label: 'Homework Load Analysis Report',
  },
  {
    name: HomeworkAssignmentAnalyticReportTitle.AssignmentLoadAnalysisReport,
    label: 'Assignment Load Analysis Report',
  },
  {
    name: HomeworkAssignmentAnalyticReportTitle.TeacherPerformanceInHomeworkEvaluationReport,
    label: 'Teacher Performance in Homework Evaluation Report',
  },
  {
    name: HomeworkAssignmentAnalyticReportTitle.StudentPerformanceTrendReport,
    label: 'Student Performance Trend Report',
  },
  {
    name: HomeworkAssignmentAnalyticReportTitle.ClasswiseOverallHomeworkAssignmentReport,
    label: 'Class-wise Overall Homework & Assignment Report',
  },
];
