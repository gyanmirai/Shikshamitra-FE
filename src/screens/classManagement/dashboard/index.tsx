'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import ClassManagementDashboardView from './components/ClassManagementDashboardView';

const ClassManagementDashboard = () => {
  const { employee } = useSelector((state: RootState) => state.auth);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const role = employee?.role?.name;

  return (
    <Box>
      <ClassManagementDashboardView
        role={['Admin', 'Principal', 'Teacher'].includes(role) ? role : 'Admin'}
        academicMediumId={(currentMedium as { id?: string })?.id}
      />
    </Box>
  );
};

export default ClassManagementDashboard;
