'use client';

import type { RootState } from 'src/redux/store';
import type { SelectChangeEvent } from '@mui/material';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Card,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
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

const MainDashboard = () => {
  const { data: session, status } = useSession() as any;
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

  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate>(resolvedTemplate);

  useEffect(() => {
    setSelectedTemplate(resolvedTemplate);
  }, [resolvedTemplate]);

  const currentTemplate = selectedTemplate || resolvedTemplate;
  const dashboardDataSourceMode = getDashboardDataSourceMode(
    searchParams.get('dashboardDataSource')
  );
  const dashboardDataSource = useDashboardDataSource({
    template: currentTemplate,
    mode: dashboardDataSourceMode,
    academicYearId: typeof currentYear?.id === 'string' ? currentYear.id : undefined,
  });

  if (status === 'loading') {
    return (
      <Box
        sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const nextTemplate = event.target.value;
    if (isDashboardTemplate(nextTemplate)) {
      setSelectedTemplate(nextTemplate);
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
        <Alert severity="warning" sx={{ mb: 1 }} data-testid="dashboard-data-source-error">
          {dashboardDataSource.globalError}
        </Alert>
      )}

      <DashboardTemplateView
        data={dashboardDataSource.data}
        permissions={permissions}
        enforcePermissions={permissionsInitialized}
        loadingZones={dashboardDataSource.loadingZones}
        zoneErrors={dashboardDataSource.zoneErrors}
      />
    </Box>
  );
};

export default MainDashboard;
