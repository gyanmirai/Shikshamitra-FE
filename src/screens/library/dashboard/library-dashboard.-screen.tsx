'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Typography, CircularProgress } from '@mui/material';
import { useGetLibraryDashboardOverviewQuery } from 'src/redux/library/dashboard-api';

import AdminDashboard from './admin';
import PrincipalDashboard from './principal';

const LibraryDashboard = () => {
  const { employee } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const role = employee?.role?.name;
  const academicYearId = (currentYear as any)?.id;

  const {
    data: overview,
    isLoading,
    isFetching,
    isError,
  } = useGetLibraryDashboardOverviewQuery(
    { academicYearId },
    { skip: !academicYearId, refetchOnMountOrArgChange: true }
  );

  if (!academicYearId) {
    return (
      <Alert severity="info" data-testid="library-dashboard-page">
        Select an academic year to load the Library dashboard.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        data-testid="library-dashboard-page"
        sx={{ py: 8, display: 'grid', placeItems: 'center' }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Loading library dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" data-testid="library-dashboard-page">
        Could not load the Library dashboard overview.
      </Alert>
    );
  }

  return (
    <Box data-testid="library-dashboard-page">
      {(role === 'Librarian' || role === 'Admin') && (
        <AdminDashboard overview={overview} isRefreshing={isFetching} />
      )}
      {role === 'Principal' && <PrincipalDashboard overview={overview} />}
      {/* Fallback to Principal dashboard if role not recognized */}
      {!['Librarian', 'Admin', 'Principal'].includes(role) && (
        <AdminDashboard overview={overview} isRefreshing={isFetching} />
      )}
    </Box>
  );
};

export default LibraryDashboard;
