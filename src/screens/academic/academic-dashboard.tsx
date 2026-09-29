'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Box, Alert, Button } from '@mui/material';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetAcademicDashboardContextQuery } from 'src/redux/academicAPI/academicDashboardApi';

import {
  getAcademicSessionRoles,
  resolveAcademicDashboardMode,
} from './academic-dashboard-resolver';

const dashboardLoading = () => <LoadingScreen sx={{ minHeight: 320 }} />;

const AcademicTeacherDashboardScreen = dynamic(() => import('./dashboard'), {
  loading: dashboardLoading,
});
const AcademicDashboardScreen = dynamic(() => import('./AcademicDashboard'), {
  loading: dashboardLoading,
});
const AcademicPrincipalDashboardScreen = dynamic(() => import('./AcademicPrincipalDashboard'), {
  loading: dashboardLoading,
});
const CommonAcademicDashboardScreen = dynamic(() => import('./CommonAcademicDashboard'), {
  loading: dashboardLoading,
});

const AcademicDashboard = () => {
  const { data: session, status } = useSession();
  const {
    data: dashboardContext,
    isLoading: isContextLoading,
    isError: isContextError,
    refetch: refetchContext,
  } = useGetAcademicDashboardContextQuery(undefined, { skip: status !== 'authenticated' });
  const fallbackMode = resolveAcademicDashboardMode(getAcademicSessionRoles(session));
  const dashboardMode = dashboardContext?.defaultMode || fallbackMode;

  if (status === 'loading' || (status === 'authenticated' && isContextLoading)) {
    return <LoadingScreen sx={{ minHeight: 320 }} />;
  }

  const renderDashboard = () => {
    switch (dashboardMode) {
      case 'admin':
        return <AcademicDashboardScreen />;
      case 'classTeacher':
        return (
          <AcademicTeacherDashboardScreen
            mode="classTeacher"
            classAssignments={dashboardContext?.classAssignments}
            supportsSections={dashboardContext?.supportsSectionDashboard === true}
          />
        );
      case 'teacher':
        return (
          <AcademicTeacherDashboardScreen
            supportsSections={dashboardContext?.supportsSectionDashboard === true}
          />
        );
      case 'leadership':
        return (
          <AcademicPrincipalDashboardScreen
            supportsSections={dashboardContext?.supportsSectionDashboard === true}
          />
        );
      default:
        return <CommonAcademicDashboardScreen displayName={dashboardContext?.displayName} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {isContextError ? (
        <Alert
          severity="warning"
          sx={{ mb: 1 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetchContext()}>
              Retry
            </Button>
          }
        >
          The server could not confirm your dashboard mode. A safe role-based view is being shown.
        </Alert>
      ) : null}
      {renderDashboard()}
    </Box>
  );
};

export default AcademicDashboard;
