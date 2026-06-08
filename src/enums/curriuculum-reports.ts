export enum CurriculumReportTitle {
  ChapterProgressReport,
  SubjectWiseChapterCoverage,
  ChapterDescriptionSummary,
  TimelineReport,
  ClassWiseChapterAssignmentReport,
  CurriculumCompletionReport,
  ChapterRevisionAndRevisitTracker,
}

export const CurriculumReportApiTypeMap: Record<CurriculumReportTitle, string> = {
  [CurriculumReportTitle.ChapterProgressReport]: 'ChapterProgressReport',
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: 'SubjectWiseChapterCoverage',
  [CurriculumReportTitle.ChapterDescriptionSummary]: 'ChapterDescriptionSummary',
  [CurriculumReportTitle.TimelineReport]: 'TimelineReport',
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: 'ClassWiseChapterAssignment',
  [CurriculumReportTitle.CurriculumCompletionReport]: 'CurriculumCompletionReport',
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: 'ChapterRevisionTracker',
};

export const CurriculumReportTitleOptions = [
  {
    name: CurriculumReportTitle.ChapterProgressReport,
    label: 'Chapter Progress Report',
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
