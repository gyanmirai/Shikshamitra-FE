'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

import AcademicTeacherDashboardScreen from './dashboard';
import AcademicDashboardScreen from './AcademicDashboard';
import AcademicPrincipalDashboardScreen from './AcademicPrincipalDashboard';

const AcademicDashboard = () => {
  const { data: session, status } = useSession() as any;
  const currentRole = session?.profile?.role?.toLowerCase() || 'teacher';

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
        return <AcademicDashboardScreen />;
      case 'teacher':
        return <AcademicTeacherDashboardScreen />;
      case 'principal':
        return <AcademicPrincipalDashboardScreen />;
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

export default AcademicDashboard;
