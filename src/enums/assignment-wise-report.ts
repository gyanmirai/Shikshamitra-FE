export enum AssignmentReportTitle {
  AssignmentIssuanceReport,
  AssignmentSubmissionReport,
  AssignmentEvaluationReport,
  AssignmentMarksReport,
  LateSubmissionReport,
  MissingAssignmentReport,
  AssignmentFeedbackReport,
  AssignmentGradeDistributionReport,
  AssignmentPerformanceReport,
}

export const AssignmentReportApiTypeMap: Record<AssignmentReportTitle, string> = {
  [AssignmentReportTitle.AssignmentIssuanceReport]: 'Assignment Issuance Report',
  [AssignmentReportTitle.AssignmentSubmissionReport]: 'Assignment Submission Report',
  [AssignmentReportTitle.AssignmentEvaluationReport]: 'Assignment Evaluation Report',
  [AssignmentReportTitle.AssignmentMarksReport]: 'Assignment Marks Report',
  [AssignmentReportTitle.LateSubmissionReport]: 'Late Submission Report',
  [AssignmentReportTitle.MissingAssignmentReport]: 'Missing Assignment Report',
  [AssignmentReportTitle.AssignmentFeedbackReport]: 'Assignment Feedback Report',
  [AssignmentReportTitle.AssignmentGradeDistributionReport]: 'Assignment Grade Distribution Report',
  [AssignmentReportTitle.AssignmentPerformanceReport]: 'Assignment Performance Report',
};

export const AssignmentReportTitleOptions = [
  {
    name: AssignmentReportTitle.AssignmentIssuanceReport,
    label: 'Assignment Issuance Report',
  },
  {
    name: AssignmentReportTitle.AssignmentSubmissionReport,
    label: 'Assignment Submission Report',
  },
  {
    name: AssignmentReportTitle.AssignmentEvaluationReport,
    label: 'Assignment Evaluation Report',
  },
  {
    name: AssignmentReportTitle.AssignmentMarksReport,
    label: 'Assignment Marks Report',
  },
  {
    name: AssignmentReportTitle.LateSubmissionReport,
    label: 'Late Submission Report',
  },
  {
    name: AssignmentReportTitle.MissingAssignmentReport,
    label: 'Missing Assignment Report',
  },
  {
    name: AssignmentReportTitle.AssignmentFeedbackReport,
    label: 'Assignment Feedback Report',
  },
  {
    name: AssignmentReportTitle.AssignmentGradeDistributionReport,
    label: 'Assignment Grade Distribution Report',
  },
  {
    name: AssignmentReportTitle.AssignmentPerformanceReport,
    label: 'Assignment Performance Report',
  },
];
