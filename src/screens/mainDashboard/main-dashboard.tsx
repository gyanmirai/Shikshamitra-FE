'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

import UserDashboard from './userDashboard/UserDashboard';
import MainDashboardAdmin from './admin/main-dashboard-admin';
import MainDashboardTeacher from './teacher/main-dashboard-teacher';
import MainDashboardPrincipal from './principal/main-dashboard-principal';

const MainDashboard = () => {
  const { data: session, status } = useSession() as any;
  const currentRole = session?.profile?.role?.toLowerCase() || 'admin';

  if (status === 'loading') {
    return (
      <Box
        sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderDashboard = () => {
    switch (currentRole) {
      case 'admin':
        return <MainDashboardAdmin />;
      case 'principal':
        return <MainDashboardPrincipal />;
      case 'teacher':
        return <MainDashboardTeacher />;
      case 'user':
        return <UserDashboard />;
      default:
        return (
          <Stack sx={{ p: 5, alignItems: 'center' }}>
            <Typography variant="h4">Welcome!</Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              We couldn&apos;t determine your role. Please contact support.
            </Typography>
          </Stack>
        );
    }
  };

  return <Box sx={{ width: '100%' }}>{renderDashboard()}</Box>;
};

export default MainDashboard;
