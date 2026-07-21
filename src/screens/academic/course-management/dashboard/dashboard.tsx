'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import CousreDetails from './component/cousreDetails';
import StudentPerformance from './component/studentPerformance';
import StudentCoursePerfoemance from './component/studentCoursePerfoemance';

const Dashboard = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      sx={{ mb: 1 }}
      heading="Dashboard"
      links={[{ name: 'Academics' }, { name: 'Course' }, { name: 'Dashboard' }]}
      action={
        <DashBoardQuickAction
          actions={[
            {
              icon: 'mdi:plus',
              label: 'Add New Course',
              href: '/academic/course-management/subjects',
              color: 'primary',
            },
            {
              icon: 'mdi:progress-helper',
              label: 'Course Progress',
              href: '/academic/course-management/courseProgress',
              color: 'warning',
            },
            {
              icon: 'simple-icons:googledocs',
              label: 'General Reports',
              href: '/academic/course-management/reports',
              color: 'secondary',
            },
          ]}
        />
      }
    />
    <StudentPerformance />
    <StudentCoursePerfoemance />
    <CousreDetails />
  </Box>
);

export default Dashboard;
