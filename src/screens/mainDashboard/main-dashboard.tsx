'use client';

import type { RootState } from 'src/redux/store';
import type { SelectChangeEvent } from '@mui/material';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Select,
  Skeleton,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

import DashboardTemplateView from './dashboard-template-view';
import { type DashboardTemplate, DASHBOARD_TEMPLATE_OPTIONS } from './dashboard-types';
import { useDashboardDataSource, getDashboardDataSourceMode } from './dashboard-data-source';
import {
  getSessionRoles,
  isDashboardTemplate,
  resolveDashboardTemplate,
  getSessionDashboardTemplate,
} from './dashboard-template-resolver';

const isTemplateSwitcherEnabled =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_TEMPLATE_SWITCHER === 'true';

function DashboardInitialLoading() {
  return (
    <Stack
      spacing={2.5}
      sx={{ width: '100%', px: { xs: 2, sm: 3 }, py: 3 }}
      aria-label="Loading dashboard"
    >
      <Skeleton variant="rounded" height={164} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rounded" height={160} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}

const MainDashboard = () => {
  const { data: session, status } = useSession() as any;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const queryTemplate = searchParams.get('dashboardTemplate');
  const templateOverride =
    isTemplateSwitcherEnabled && isDashboardTemplate(queryTemplate) ? queryTemplate : null;

  const resolvedTemplate = useMemo(
    () =>
      resolveDashboardTemplate({
        roles: getSessionRoles(session),
        explicitTemplate: templateOverride || getSessionDashboardTemplate(session),
      }),
    [session, templateOverride]
  );

  const currentTemplate = resolvedTemplate;
  const dashboardDataSourceMode = getDashboardDataSourceMode(
    searchParams.get('dashboardDataSource')
  );
  const dashboardDataSource = useDashboardDataSource({
    template: currentTemplate,
    mode: dashboardDataSourceMode,
    academicYearId: typeof currentYear?.id === 'string' ? currentYear.id : undefined,
  });

  if (status === 'loading') {
    return <DashboardInitialLoading />;
  }

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const nextTemplate = event.target.value;
    if (isDashboardTemplate(nextTemplate)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('dashboardTemplate', nextTemplate);
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <Box sx={{ width: '100%' }} data-dashboard-source={dashboardDataSource.source}>
      {isTemplateSwitcherEnabled && (
        <Card
          sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, p: 1 }}
          data-testid="dashboard-template-switcher"
        >
          <FormControl size="small" sx={{ minWidth: 210, bgcolor: 'background.paper' }}>
            <InputLabel id="dashboard-template-filter-label">Dashboard Template</InputLabel>
            <Select
              labelId="dashboard-template-filter-label"
              id="dashboard-template-filter"
              value={currentTemplate}
              label="Dashboard Template"
              onChange={handleTemplateChange}
            >
              {DASHBOARD_TEMPLATE_OPTIONS.map((templateOption) => (
                <MenuItem key={templateOption.template} value={templateOption.template}>
                  {templateOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>
      )}

      {dashboardDataSource.globalError && (
        <Alert
          severity="warning"
          sx={{ mx: { xs: 2, sm: 3 }, mt: 2 }}
          data-testid="dashboard-data-source-error"
          action={
            dashboardDataSource.retry ? (
              <Button color="inherit" size="small" onClick={dashboardDataSource.retry}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {dashboardDataSource.globalError}
        </Alert>
      )}

      <DashboardTemplateView
        data={dashboardDataSource.data}
        permissions={permissions}
        enforcePermissions={permissionsInitialized}
        loadingZones={dashboardDataSource.loadingZones}
        zoneErrors={dashboardDataSource.zoneErrors}
        onRetry={dashboardDataSource.retry}
      />
    </Box>
  );
};

export default MainDashboard;
