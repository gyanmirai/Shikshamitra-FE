'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import { useGetLibraryDashboardOverviewQuery } from 'src/redux/library/dashboard-api';

import AdminDashboard from './admin';
import PrincipalDashboard from './principal';

const LibraryDashboard = () => {
  const { employee } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as { id?: string })?.id;
  const {
    currentData: overview,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLibraryDashboardOverviewQuery(
    { academicYearId },
    { skip: !academicYearId, refetchOnMountOrArgChange: true }
  );

  return (
    <Box data-testid="library-dashboard-page">
      <CustomBreadcrumbs
        heading="Library Dashboard"
        description="Review library stock, borrowing, reservations, and charges for the selected academic year."
        links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Dashboard' }]}
        action={
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={!academicYearId || isFetching}
            onClick={() => refetch()}
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
          >
            Refresh
          </Button>
        }
      />
      <Stack spacing={2}>
        {!academicYearId && (
          <Alert severity="info">Select an academic year to load the Library dashboard.</Alert>
        )}
        {(isLoading || isFetching) && <LinearProgress aria-label="Loading library dashboard" />}
        {isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Could not load the Library dashboard overview.
          </Alert>
        )}
        {overview && (
          <>
            {isFetching && (
              <Typography variant="caption" color="text.secondary">
                Refreshing library overview…
              </Typography>
            )}
            {employee?.role?.name === 'Principal' ? (
              <PrincipalDashboard overview={overview} />
            ) : (
              <AdminDashboard overview={overview} />
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};

export default LibraryDashboard;
