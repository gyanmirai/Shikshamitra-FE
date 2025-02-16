'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import MainDashboardPrincipal from './principal/main-dashboard-principal';

const MainDashboard = () => (
  <>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'Shikshamitra' }, { name: 'Dashboard' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <MainDashboardPrincipal />{' '}
  </>
);

export default MainDashboard;
