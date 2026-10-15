'use client';

import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentModuleDashboardLink,
  StudentModuleDashboardContext,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Alert, Paper, Stack, Button, Skeleton, LinearProgress } from '@mui/material';

import { AdminDashboardClasses } from './admin-dashboard-classes';
import { AdminDashboardOverview } from './admin-dashboard-overview';
import { AdminDashboardAttention } from './admin-dashboard-attention';
import { AdminDashboardAttendance } from './admin-dashboard-attendance';
import { useAdminDashboardScope } from '../hooks/use-admin-dashboard-scope';
import { useStudentDashboardSections } from '../hooks/use-student-dashboard-sections';
import StudentDirectoryFilterFields from '../../records/student-directory-filter-fields';
import { emptyDashboardFilters, dashboardDisplayFilters } from '../admin-dashboard-scope';
import { AdminDashboardOnboarding, AdminDashboardWorkGroups } from './admin-dashboard-work';

export default function AdminDashboardWorkspace({
  context,
  links,
  permissions,
  identityKey,
  year,
  refresh,
  confirmingAccess,
}: {
  context: StudentModuleDashboardContext;
  links: StudentModuleDashboardLink[];
  permissions: GrantedPermission[];
  identityKey: string;
  year: { id?: string; name?: string };
  refresh: () => void;
  confirmingAccess: boolean;
}) {
  const {
    filters,
    scope,
    options,
    valid,
    query: filterQuery,
    update,
  } = useAdminDashboardScope(identityKey, year.id ?? '', context.sections.length > 0);
  const queries = useStudentDashboardSections(context.sections, identityKey, year.id, scope, valid);
  const hasLink = (id: string) => links.some((link) => link.id === id);
  const hasFilters = Object.values(filters).some(Boolean);
  const scopeKey = JSON.stringify(scope);
  const directory = links.find((link) => link.id === 'directory');
  const directoryParams = new URLSearchParams({
    population: 'Active',
    dashboard: 'directory',
    year: year.id ?? '',
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) directoryParams.set(key, value);
  });
  const directoryHref = directory
    ? `${studentPaths.records.directory}?${directoryParams}`
    : undefined;
  const activeQueries = context.sections.map((key) => queries[key]);
  const refreshing =
    confirmingAccess || filterQuery.isFetching || activeQueries.some((query) => query.isFetching);
  const workSections = context.sections.filter((section) =>
    section === 'records'
      ? hasLink('changes')
      : section === 'admissions'
        ? hasLink('applications') || hasLink('inquiries')
        : hasLink('leave')
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Student Dashboard"
        description="Understand student progress, resolve blockers and keep work moving."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'Dashboard' }]}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={refresh}
              disabled={refreshing}
              startIcon={<Iconify icon="mdi:refresh" />}
            >
              Refresh dashboard
            </Button>
            {directoryHref && (
              <Button
                component={Link}
                href={directoryHref}
                prefetch={false}
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="mdi:magnify" />}
              >
                Find student
              </Button>
            )}
          </Stack>
        }
      />
      {confirmingAccess && <LinearProgress aria-label="Confirming student dashboard access" />}
      {!context.sections.length ? (
        <Alert severity="info">
          {context.scopeLabel}. No summaries are available with your current academic scope and
          permissions.
        </Alert>
      ) : !year.id ? (
        <Alert severity="info">
          Select an academic year in the Student header to see your dashboard.
        </Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', lg: 'flex-start' }}
            >
              <StudentDirectoryFilterFields
                values={options ? dashboardDisplayFilters(filters, options) : emptyDashboardFilters}
                options={
                  options
                    ? { ...options, academicYears: [{ id: year.id, name: year.name ?? year.id }] }
                    : undefined
                }
                isLoading={filterQuery.isFetching && !options && !filterQuery.isError}
                disabled={!options || filterQuery.isError}
                requireClassForDivision
                divisionHelpInTooltip
                onChange={update}
              />
              <Button
                size="small"
                color="inherit"
                onClick={() => update(emptyDashboardFilters)}
                disabled={!hasFilters}
                startIcon={<Iconify icon="mdi:filter-remove-outline" />}
                sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', lg: 'flex-start' } }}
              >
                Reset filters
              </Button>
            </Stack>
          </Paper>
          {filterQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => filterQuery.refetch()}>
                  Retry filters
                </Button>
              }
            >
              Academic filter choices could not be loaded. Retry to load your permitted dashboard.
            </Alert>
          ) : options && !valid ? (
            <Alert
              severity="warning"
              action={
                <Button size="small" color="inherit" onClick={() => update(emptyDashboardFilters)}>
                  Clear filters
                </Button>
              }
            >
              These academic filters are no longer available in this year or your permitted scope.
            </Alert>
          ) : !options ? (
            <Skeleton variant="rounded" height={300} aria-label="Loading dashboard filters" />
          ) : (
            <>
              <AdminDashboardOverview queries={queries} links={links} permissions={permissions} />
              <Grid container spacing={1} alignItems="stretch">
                {hasLink('onboarding') && context.sections.includes('admissions') && (
                  <Grid size={{ xs: 12, lg: workSections.length ? 8 : 12 }}>
                    <AdminDashboardAttention query={queries.admissions} />
                  </Grid>
                )}
                {workSections.length > 0 && (
                  <Grid size={{ xs: 12, lg: hasLink('onboarding') ? 4 : 12 }}>
                    <AdminDashboardWorkGroups
                      queries={queries}
                      sections={workSections}
                      permissions={permissions}
                    />
                  </Grid>
                )}
                {hasLink('onboarding') && context.sections.includes('admissions') && (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AdminDashboardOnboarding
                      query={queries.admissions}
                      permissions={permissions}
                    />
                  </Grid>
                )}
                {directory && context.sections.includes('records') && (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AdminDashboardClasses
                      key={`${identityKey}:${year.id}:${scopeKey}`}
                      query={queries.records}
                      directoryHref={directoryHref}
                      options={options}
                    />
                  </Grid>
                )}
                {hasLink('attendance') && context.sections.includes('attendance') && (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <AdminDashboardAttendance query={queries.attendance} />
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
}
