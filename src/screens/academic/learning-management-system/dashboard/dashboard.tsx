'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CalendarView } from 'src/sections/calendar/view/calendar-view';

import LmsDashboardCards from './component/lmsDashboardCards';
import DashboardCourseOverview from './component/dashboardCourseOverview';
import DashboardProgressVisualization from './component/dashboardProgressVisualization';

const Dashboard = (props: TabComponentType) => (
  <Box sx={{ flexGrow: 1 }}>
    <CustomBreadcrumbs
      sx={{ mb: 1 }}
      heading="Dashboard"
      links={[{ name: 'Academics' }, { name: 'Learning Management System' }, { name: 'Dashboard' }]}
    />
    <LmsDashboardCards />
    <DashboardCourseOverview />
    <DashboardProgressVisualization />
    <Box display="flex" width="1215px" height="700px" ml="-40px">
      <CalendarView />
    </Box>
  </Box>
);

export default Dashboard;
