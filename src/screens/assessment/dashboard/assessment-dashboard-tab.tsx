import { Box } from '@mui/material'
import React from 'react'
import AssessmentDashboardOverviewComponent from './component/assessment-dashboard-overview-component'
import AssessmentDashboardListComponent from './component/assessment-dashboard-list-component'
import AssessmentDashboardReportComponent from './component/assessment-dashboard-report-component'

const AssessmentDashboardTab = () => {
  return (
    <>
      <AssessmentDashboardOverviewComponent />
      <AssessmentDashboardListComponent />
      <AssessmentDashboardReportComponent />
    </>

  )
}

export default AssessmentDashboardTab