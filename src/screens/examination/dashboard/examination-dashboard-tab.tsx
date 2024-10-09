import React from 'react';

import ExamninationDashboardReportComponent from './component/examnination-dashboard-report-component';
import ExaminationDashboardOverviewComponent from './component/examination-dashboard-overview-component';
import ExaminationDashboardExamlistComponent from './component/examination-dashboard-examlist-component';

const ExaminationDashboardTab = () => (
  <>
    <ExaminationDashboardOverviewComponent />
    <ExaminationDashboardExamlistComponent />
    <ExamninationDashboardReportComponent />
  </>
);

export default ExaminationDashboardTab;
