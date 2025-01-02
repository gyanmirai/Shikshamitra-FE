import React from 'react';

import AssessmentDashboardListComponent from './component/assessment-dashboard-list-component';
import AssessmentDashboardReportComponent from './component/assessment-dashboard-report-component';
import AssessmentDashboardOverviewComponent from './component/assessment-dashboard-overview-component';

const AssessmentDashboardTab = () => (
  <>
    <AssessmentDashboardOverviewComponent />
    <AssessmentDashboardListComponent />
    <AssessmentDashboardReportComponent />
  </>
);

export default AssessmentDashboardTab;
