import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import ExamninationDashboardReportComponent from './component/examnination-dashboard-report-component';
import ExaminationDashboardOverviewComponent from './component/examination-dashboard-overview-component';
import ExaminationDashboardExamlistComponent from './component/examination-dashboard-examlist-component';

const ExaminationDashboardTab = (props: TabComponentType) => (
  <>
    <ExaminationDashboardOverviewComponent />
    <ExaminationDashboardExamlistComponent />
    <ExamninationDashboardReportComponent />
  </>
);

export default ExaminationDashboardTab;
