import React from 'react'
import ExaminationDashboardOverviewComponent from './component/examination-dashboard-overview-component'
import ExaminationDashboardExamlistComponent from './component/examination-dashboard-examlist-component'
import ExamninationDashboardReportComponent from './component/examnination-dashboard-report-component'

const ExaminationDashboardTab = () => {
  return (
    <>
    <ExaminationDashboardOverviewComponent/>
    <ExaminationDashboardExamlistComponent/>
    <ExamninationDashboardReportComponent/>
    </>
  )
}

export default ExaminationDashboardTab