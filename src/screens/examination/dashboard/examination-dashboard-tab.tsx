'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import ExaminationDashboardOverviewComponent from './component/examination-dashboard-overview-component';
import ExaminationDashboardExamlistComponent from './component/examination-dashboard-examlist-component';

const ExaminationDashboardTab = (props: TabComponentType) => (
  <>
    <ExaminationDashboardOverviewComponent {...props} />
    <ExaminationDashboardExamlistComponent {...props} />
    {/* <ExamninationDashboardReportComponent {...props}/> */}
  </>
);

export default ExaminationDashboardTab;
