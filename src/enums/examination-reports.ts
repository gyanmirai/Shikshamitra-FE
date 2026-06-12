export enum ExamReportTitle {
  AverageSubjectMarkAnalysis,
  BrightStudentAnalysis,
  BrightStudentListSubjectWise,
  GenderWiseGradeAnalysis,
  MarkListWithAllSubject,
  ResultList,
  SubjectAverageClassMarkAnalysisDivisionWise,
  ResultListConsolidateVerify,
  ResultListConsolidateWithMarkGrade,
  ResultListConsolidateWithMarks,
  ResultListConsolidateWithMarksSiddhiKrupa,
  ResultListOneGrade,
  ResultListOneMark,
  ResultListTwoMark,
  ResultListWithSubject,
  ResultListWithSubjectFailedDetails,
  ResultListWithSubjectGrade,
  ResultListWithSubjectSmall,
  ResultListWithSubjectWithGrace,
  ResultOverAllSynopsis,
  ResultStatisticsReport,
  ResultWithAllSubjectList,
  ResultListOverallGradeAnalysis,
  ResultListPassFailAnalysisSubjectWise,
  ResultListPassFailOverAllAnalysis,
  ResultListSubjectGradeAnalysis,
  StudentAllBatchResult,
  StudentAllExamResult,
  StudentGradeAnalysis,
  StudentGradeAnalysisSubjectWise,
  SubjectWiseGradeList,
  WeakStudentAnalysis,
  WeakStudentAnalysisSubjectWise,
}

export const ExamReportApiTypeMap: Record<ExamReportTitle, string> = {
  [ExamReportTitle.AverageSubjectMarkAnalysis]: 'Average Subject Mark Analysis',
  [ExamReportTitle.BrightStudentAnalysis]: 'Bright Student Analysis',
  [ExamReportTitle.BrightStudentListSubjectWise]: 'Bright Student List Subject Wise',
  [ExamReportTitle.GenderWiseGradeAnalysis]: 'Gender Wise Grade Analysis',
  [ExamReportTitle.MarkListWithAllSubject]: 'Mark List With All Subject',
  [ExamReportTitle.ResultList]: 'Result List',
  [ExamReportTitle.SubjectAverageClassMarkAnalysisDivisionWise]:
    'Subject Average Class Mark Analysis Division Wise',
  [ExamReportTitle.ResultListConsolidateVerify]: 'Result List Consolidate Verify',
  [ExamReportTitle.ResultListConsolidateWithMarkGrade]: 'Result List Consolidate With Mark Grade',
  [ExamReportTitle.ResultListConsolidateWithMarks]: 'Result List Consolidate With Marks',
  [ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa]:
    'Result List Consolidate With Marks - Siddhi Krupa',
  [ExamReportTitle.ResultListOneGrade]: 'Result List One Grade',
  [ExamReportTitle.ResultListOneMark]: 'Result List One Mark',
  [ExamReportTitle.ResultListTwoMark]: 'Result List Two Mark',
  [ExamReportTitle.ResultListWithSubject]: 'Result List With Subject',
  [ExamReportTitle.ResultListWithSubjectFailedDetails]: 'Result List With Subject Failed Details',
  [ExamReportTitle.ResultListWithSubjectGrade]: 'Result List With Subject Grade',
  [ExamReportTitle.ResultListWithSubjectSmall]: 'Result List With Subject Small',
  [ExamReportTitle.ResultListWithSubjectWithGrace]: 'Result List With Subject With Grace',
  [ExamReportTitle.ResultOverAllSynopsis]: 'Result Over All Synopsis',
  [ExamReportTitle.ResultStatisticsReport]: 'Result Statistics Report',
  [ExamReportTitle.ResultWithAllSubjectList]: 'Result With All Subject List',
  [ExamReportTitle.ResultListOverallGradeAnalysis]: 'Result List Overall Grade Analysis',
  [ExamReportTitle.ResultListPassFailAnalysisSubjectWise]:
    'Result List Pass-Fail Analysis Subject Wise',
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: 'Result List Pass-Fail Overall Analysis',
  [ExamReportTitle.ResultListSubjectGradeAnalysis]: 'Result List Subject Grade Analysis',
  [ExamReportTitle.StudentAllBatchResult]: 'Student All Batch Result',
  [ExamReportTitle.StudentAllExamResult]: 'Student All Exam Result',
  [ExamReportTitle.StudentGradeAnalysis]: 'Student Grade Analysis',
  [ExamReportTitle.StudentGradeAnalysisSubjectWise]: 'Student Grade Analysis Subject Wise',
  [ExamReportTitle.SubjectWiseGradeList]: 'Subject Wise Grade List',
  [ExamReportTitle.WeakStudentAnalysis]: 'Weak Student Analysis',
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: 'Weak Student Analysis Subject Wise',
};

export const ExamReportTitleOptions = [
  { name: ExamReportTitle.BrightStudentAnalysis, label: 'Bright Student Analysis' },
  { name: ExamReportTitle.BrightStudentListSubjectWise, label: 'Bright Student List Subject Wise' },
  { name: ExamReportTitle.GenderWiseGradeAnalysis, label: 'Gender Wise Grade Analysis' },
  { name: ExamReportTitle.MarkListWithAllSubject, label: 'Mark List With All Subject' },
  { name: ExamReportTitle.ResultList, label: 'Result List' },
  {
    name: ExamReportTitle.SubjectAverageClassMarkAnalysisDivisionWise,
    label: 'Subject Average Class Mark Analysis Division Wise',
  },
  { name: ExamReportTitle.ResultListConsolidateVerify, label: 'Result List Consolidate Verify' },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarkGrade,
    label: 'Result List Consolidate With Mark Grade',
  },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarks,
    label: 'Result List Consolidate With Marks',
  },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa,
    label: 'Result List Consolidate With Marks - Siddhi Krupa',
  },
  { name: ExamReportTitle.ResultListOneGrade, label: 'Result List One Grade' },
  { name: ExamReportTitle.ResultListOneMark, label: 'Result List One Mark' },
  { name: ExamReportTitle.ResultListTwoMark, label: 'Result List Two Mark' },
  { name: ExamReportTitle.ResultListWithSubject, label: 'Result List With Subject' },
  {
    name: ExamReportTitle.ResultListWithSubjectFailedDetails,
    label: 'Result List With Subject Failed Details',
  },
  { name: ExamReportTitle.ResultListWithSubjectGrade, label: 'Result List With Subject Grade' },
  { name: ExamReportTitle.ResultListWithSubjectSmall, label: 'Result List With Subject Small' },
  {
    name: ExamReportTitle.ResultListWithSubjectWithGrace,
    label: 'Result List With Subject With Grace',
  },
  { name: ExamReportTitle.ResultOverAllSynopsis, label: 'Result Over All Synopsis' },
  { name: ExamReportTitle.ResultStatisticsReport, label: 'Result Statistics Report' },
  { name: ExamReportTitle.ResultWithAllSubjectList, label: 'Result With All Subject List' },
  {
    name: ExamReportTitle.ResultListOverallGradeAnalysis,
    label: 'Result List Overall Grade Analysis',
  },
  {
    name: ExamReportTitle.ResultListPassFailAnalysisSubjectWise,
    label: 'Result List Pass-Fail Analysis Subject Wise',
  },
  {
    name: ExamReportTitle.ResultListPassFailOverAllAnalysis,
    label: 'Result List Pass-Fail Overall Analysis',
  },
  {
    name: ExamReportTitle.ResultListSubjectGradeAnalysis,
    label: 'Result List Subject Grade Analysis',
  },
  { name: ExamReportTitle.StudentAllBatchResult, label: 'Student All Batch Result' },
  { name: ExamReportTitle.StudentAllExamResult, label: 'Student All Exam Result' },
  { name: ExamReportTitle.StudentGradeAnalysis, label: 'Student Grade Analysis' },
  {
    name: ExamReportTitle.StudentGradeAnalysisSubjectWise,
    label: 'Student Grade Analysis Subject Wise',
  },
  { name: ExamReportTitle.SubjectWiseGradeList, label: 'Subject Wise Grade List' },
  { name: ExamReportTitle.WeakStudentAnalysis, label: 'Weak Student Analysis' },
  {
    name: ExamReportTitle.WeakStudentAnalysisSubjectWise,
    label: 'Weak Student Analysis Subject Wise',
  },
];

export const SubjectPerformanceAnalysisReportMap = [
  {
    name: ExamReportTitle.AverageSubjectMarkAnalysis,
    label: 'Average Subject Mark Analysis',
  },
  {
    name: ExamReportTitle.SubjectAverageClassMarkAnalysisDivisionWise,
    label: 'Subject Average Class Mark Analysis Division Wise',
  },
  {
    name: ExamReportTitle.StudentGradeAnalysisSubjectWise,
    label: 'Student Grade Analysis Subject Wise',
  },
  {
    name: ExamReportTitle.SubjectWiseGradeList,
    label: 'Subject Wise Grade List',
  },
  {
    name: ExamReportTitle.ResultListPassFailAnalysisSubjectWise,
    label: 'Result List Pass/Fail Analysis Subject Wise',
  },
  {
    name: ExamReportTitle.ResultListSubjectGradeAnalysis,
    label: 'Result List Subject Grade Analysis',
  },
  {
    name: ExamReportTitle.ResultListWithSubject,
    label: 'Result List With Subject',
  },
  {
    name: ExamReportTitle.ResultListWithSubjectFailedDetails,
    label: 'Result List With Subject Failed Details',
  },
  {
    name: ExamReportTitle.ResultListWithSubjectGrade,
    label: 'Result List With Subject Grade',
  },
  {
    name: ExamReportTitle.ResultListWithSubjectSmall,
    label: 'Result List With Subject Small',
  },
  {
    name: ExamReportTitle.ResultListWithSubjectWithGrace,
    label: 'Result List With Subject With Grace',
  },
];

export const StudentRankingBrightWeakReportMap = [
  {
    name: ExamReportTitle.BrightStudentAnalysis,
    label: 'Bright Student Analysis',
  },
  {
    name: ExamReportTitle.BrightStudentListSubjectWise,
    label: 'Bright Student List Subject Wise',
  },
  {
    name: ExamReportTitle.WeakStudentAnalysis,
    label: 'Weak Student Analysis',
  },
  {
    name: ExamReportTitle.WeakStudentAnalysisSubjectWise,
    label: 'Weak Student Analysis Subject Wise',
  },
  {
    name: ExamReportTitle.StudentGradeAnalysis,
    label: 'Student Grade Analysis',
  },
  {
    name: ExamReportTitle.ResultListPassFailOverAllAnalysis,
    label: 'Result List Pass/Fail Overall Analysis',
  },
  {
    name: ExamReportTitle.ResultListOverallGradeAnalysis,
    label: 'Result List Overall Grade Analysis',
  },
];

export const StandardResultListReportMap = [
  {
    name: ExamReportTitle.ResultList,
    label: 'Result List',
  },
  {
    name: ExamReportTitle.ResultListOneGrade,
    label: 'Result List One Grade',
  },
  {
    name: ExamReportTitle.ResultListOneMark,
    label: 'Result List One Mark',
  },
  {
    name: ExamReportTitle.ResultListTwoMark,
    label: 'Result List Two Mark',
  },
  {
    name: ExamReportTitle.MarkListWithAllSubject,
    label: 'Result List With All Subject',
  },
  {
    name: ExamReportTitle.ResultWithAllSubjectList,
    label: 'Result With All Subject List',
  },
  {
    name: ExamReportTitle.ResultOverAllSynopsis,
    label: 'Result Over All Synopsis',
  },
];

export const ConsolidatedMultiExamReportMap = [
  {
    name: ExamReportTitle.ResultListConsolidateVerify,
    label: 'Result List Consolidate Verify',
  },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarkGrade,
    label: 'Result List Consolidate With Mark Grade',
  },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarks,
    label: 'Result List Consolidate With Marks',
  },
  {
    name: ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa,
    label: 'Result List Consolidate With Marks (Siddhi Krupa)',
  },
];

export const StudentWiseResultReportMap = [
  {
    name: ExamReportTitle.StudentAllBatchResult,
    label: 'Student All Batch Result',
  },
  {
    name: ExamReportTitle.StudentAllExamResult,
    label: 'Student All Exam Result',
  },
];

export const GeneralGradePerformanceReportMap = [
  {
    name: ExamReportTitle.GenderWiseGradeAnalysis,
    label: 'Gender Wise Grade Analysis',
  },
  {
    name: ExamReportTitle.ResultStatisticsReport,
    label: 'Result Statistics Report',
  },
];
