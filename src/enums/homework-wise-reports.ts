export enum HomeworkReportTitle {
  DailyHomeworkReport,
  ClassWiseHomeworkReport,
  SubjectWiseHomeworkReport,
  TeacherWiseHomeworkReport,
  StudentWiseHomeworkSummaryReport,
  HomeworkCompletionStatusReport,
  PendingHomeworkReport,
  OverdueHomeworkReport,
  HomeworkSubmissionHistoryReport,
  HomeworkWithAttachmentsReport,
  HomeworkAcknowledgementReport,
}

export const HomeworkReportApiTypeMap: Record<HomeworkReportTitle, string> = {
  [HomeworkReportTitle.DailyHomeworkReport]: 'Daily Homework Report',
  [HomeworkReportTitle.ClassWiseHomeworkReport]: 'Class-wise Homework Report',
  [HomeworkReportTitle.SubjectWiseHomeworkReport]: 'Subject-wise Homework Report',
  [HomeworkReportTitle.TeacherWiseHomeworkReport]: 'Teacher-wise Homework Report',
  [HomeworkReportTitle.StudentWiseHomeworkSummaryReport]: 'Student-wise Homework Summary Report',
  [HomeworkReportTitle.HomeworkCompletionStatusReport]: 'Homework Completion Status Report',
  [HomeworkReportTitle.PendingHomeworkReport]: 'Pending Homework Report',
  [HomeworkReportTitle.OverdueHomeworkReport]: 'Overdue Homework Report',
  [HomeworkReportTitle.HomeworkSubmissionHistoryReport]: 'Homework Submission History Report',
  [HomeworkReportTitle.HomeworkWithAttachmentsReport]: 'Homework with Attachments Report',
  [HomeworkReportTitle.HomeworkAcknowledgementReport]: 'Homework Acknowledgement Report',
};

export const HomeworkReportTitleOptions = [
  {
    name: HomeworkReportTitle.DailyHomeworkReport,
    label: 'Daily Homework Report',
  },
  {
    name: HomeworkReportTitle.ClassWiseHomeworkReport,
    label: 'Class-wise Homework Report',
  },
  {
    name: HomeworkReportTitle.SubjectWiseHomeworkReport,
    label: 'Subject-wise Homework Report',
  },
  {
    name: HomeworkReportTitle.TeacherWiseHomeworkReport,
    label: 'Teacher-wise Homework Report',
  },
  {
    name: HomeworkReportTitle.StudentWiseHomeworkSummaryReport,
    label: 'Student-wise Homework Summary Report',
  },
  {
    name: HomeworkReportTitle.HomeworkCompletionStatusReport,
    label: 'Homework Completion Status Report',
  },
  {
    name: HomeworkReportTitle.PendingHomeworkReport,
    label: 'Pending Homework Report',
  },
  {
    name: HomeworkReportTitle.OverdueHomeworkReport,
    label: 'Overdue Homework Report',
  },
  {
    name: HomeworkReportTitle.HomeworkSubmissionHistoryReport,
    label: 'Homework Submission History Report',
  },
  {
    name: HomeworkReportTitle.HomeworkWithAttachmentsReport,
    label: 'Homework with Attachments Report',
  },
  {
    name: HomeworkReportTitle.HomeworkAcknowledgementReport,
    label: 'Homework Acknowledgement Report',
  },
];
