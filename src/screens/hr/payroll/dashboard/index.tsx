'use client';

// src/Dashboard.js
import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MonthCards from './component/MonthCards';
import DashboardMiddleChart from './component/dashboardMiddleChart';
import DashboardDonutPieChart from './component/dashboardDonutPieChart';
import DashboardPayrollHistory from './component/dashboardPayrollHistory';

const Dashboard = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'HR' }, { name: 'Payroll' }, { name: 'Dashboard' }]}
    />
    <MonthCards />
    <DashboardMiddleChart />
    <DashboardDonutPieChart />
    <DashboardPayrollHistory />
  </Box>
);

export default Dashboard;
