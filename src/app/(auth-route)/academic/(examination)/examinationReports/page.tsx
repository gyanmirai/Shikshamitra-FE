import React from 'react';
import ExaminationReportComponent from 'src/screens/examination/ExaminationReports';

const ExamReportInitialValues = {
  report: '',
  organizations: [], // Multi
  standards: [], // Multi
  divisions: [], // Multi
  exams: [], // Multi or Single depending on report
  subjects: [], // Multi / Single / Optional
  grade: [], // Multi
  minMark: '',
  maxMark: '',
  students: [], // Multi optional
};

const ExaminationReportsScreen = () => <ExaminationReportComponent />;

export default ExaminationReportsScreen;
