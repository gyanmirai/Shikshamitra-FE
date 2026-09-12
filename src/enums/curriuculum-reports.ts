export enum CurriculumReportTitle {
  ChapterProgressReport,
  SubjectWiseChapterCoverage,
  ChapterDescriptionSummary,
  TimelineReport,
  ClassWiseChapterAssignmentReport,
  CurriculumCompletionReport,
  ChapterRevisionAndRevisitTracker,
  SubjectPrimaryTeacherReport,
}

export const CurriculumReportApiTypeMap: Record<CurriculumReportTitle, string> = {
  [CurriculumReportTitle.ChapterProgressReport]: 'Chapter Progress Report',
  [CurriculumReportTitle.SubjectPrimaryTeacherReport]: 'Subject Primary Teacher Report',
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: 'Subject-wise Chapter Coverage',
  [CurriculumReportTitle.ChapterDescriptionSummary]: 'Chapter Description Summary',
  [CurriculumReportTitle.TimelineReport]: 'Timeline Report',
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: 'Class-wise Chapter Assignment Report',
  [CurriculumReportTitle.CurriculumCompletionReport]: 'Curriculum Completion Report',
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: 'Chapter Revision Tracker',
};

export const CurriculumReportTitleOptions = [
  {
    name: CurriculumReportTitle.ChapterProgressReport,
    label: 'Chapter Progress Report',
  },
  {
    name: CurriculumReportTitle.SubjectPrimaryTeacherReport,
    label: 'Subject Primary Teacher Report',
  },
  {
    name: CurriculumReportTitle.SubjectWiseChapterCoverage,
    label: 'Subject-wise Chapter Coverage',
  },
  {
    name: CurriculumReportTitle.ChapterDescriptionSummary,
    label: 'Chapter Description Summary',
  },
  {
    name: CurriculumReportTitle.TimelineReport,
    label: 'Timeline Report',
  },
  {
    name: CurriculumReportTitle.ClassWiseChapterAssignmentReport,
    label: 'Class-wise Chapter Assignment Report',
  },
  {
    name: CurriculumReportTitle.CurriculumCompletionReport,
    label: 'Curriculum Completion Report',
  },
  {
    name: CurriculumReportTitle.ChapterRevisionAndRevisitTracker,
    label: 'Chapter Revision Tracker',
  },
];
