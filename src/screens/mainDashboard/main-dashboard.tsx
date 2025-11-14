'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import MainDashboardTeacher from './teacher/main-dashboard-teacher';
import MainDashboardStudent from './student/main-dashboard-student';
import MainDashboardPrincipal from './principal/main-dashboard-principal';

const MainDashboard = () => (
  <>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'Shikshamitra' }, { name: 'Dashboard' }]}
      sx={{ mb: 2 }}
    />
    <MainDashboardPrincipal />
    <MainDashboardTeacher />
    <MainDashboardStudent />
  </>
);

export default MainDashboard;
