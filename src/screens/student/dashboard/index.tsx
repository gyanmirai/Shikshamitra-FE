'use client';

import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, Skeleton, LinearProgress } from '@mui/material';

import useStudentDashboard from './hooks/use-student-dashboard';
import StudentDashboardWorkspace from './components/student-dashboard-workspace';
import AdminDashboardWorkspace from './admin-workspace/admin-dashboard-workspace';

export default function StudentDashboardScreen() {
  const {
    context,
    initialized,
    canRead,
    year,
    identityKey,
    permissions,
    links,
    refresh,
    isFetching,
    isError,
    refetch,
  } = useStudentDashboard();
  if (context?.mode === 'admin') {
    return (
      <AdminDashboardWorkspace
        context={context}
        links={links}
        permissions={permissions}
        identityKey={identityKey}
        year={year}
        refresh={refresh}
        confirmingAccess={isFetching}
      />
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Student Dashboard"
        description="Student records, your assigned work and permitted shortcuts for the selected academic year."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'Dashboard' }]}
        action={
          context && (
            <Button
              variant="outlined"
              size="small"
              onClick={refresh}
              disabled={isFetching}
              startIcon={<Iconify icon="mdi:refresh" />}
            >
              Refresh dashboard
            </Button>
          )
        }
      />
      {isFetching && <LinearProgress aria-label="Confirming student dashboard access" />}
      {initialized && !canRead && (
        <StudentFeedback notificationKey="STU-0726" presentation="inline" severity="info">
          You do not have permission to view the Student dashboard.
        </StudentFeedback>
      )}
      {isError ? (
        <StudentFeedback
          notificationKey="STU-0727"
          presentation="toast"
          severity="error"
          action={
            <Button color="inherit" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Unable to confirm your dashboard access. Retry to load your permitted workspace.
        </StudentFeedback>
      ) : context ? (
        <StudentDashboardWorkspace
          context={context}
          links={links}
          permissions={permissions}
          identityKey={identityKey}
          year={year}
        />
      ) : (
        (!initialized || canRead) && (
          <Skeleton variant="rounded" height={240} aria-label="Loading student dashboard" />
        )
      )}
    </Box>
  );
}
