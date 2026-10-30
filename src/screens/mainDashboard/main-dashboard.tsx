'use client';

import NextLink from 'next/link';
import CustomSelect from 'src/components/custom-select';
import { Box, Alert, Stack, Button } from '@mui/material';

import { useMainDashboard } from './use-main-dashboard';
import { toSafeDashboardHref } from './dashboard-navigation';
import DashboardTemplateView from './dashboard-template-view';
import { filterDashboardDataByPermissions } from './dashboard-permissions';
import { DASHBOARD_ZONE_KEYS, DASHBOARD_TEMPLATE_OPTIONS } from './dashboard-types';

export default function MainDashboard() {
  const dashboard = useMainDashboard();
  const { data } = dashboard;
  const permitted = filterDashboardDataByPermissions(data, dashboard.permissions, { enforcePermissions: true });
  const firstAction = permitted.actionItems.find((item) => toSafeDashboardHref(item.drilldownUrl));
  const selectedStudentId = data.selectedStudentId || dashboard.studentId;
  const isPreview = dashboard.source === 'mock' || dashboard.source.startsWith('contractPreview');
  const contextControls = <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
    {(data.students?.length ?? 0) > 1 && <CustomSelect size="small" label="Linked student" value={selectedStudentId}
      options={data.students ?? []} labelKey="label" valueKey="id" onChange={(value) => dashboard.selectStudent(String(value))}
      sx={{ minWidth: { xs: 180, sm: 240 } }} />}
    {dashboard.previewEnabled && <CustomSelect size="small" label="Dashboard template" value={dashboard.template}
      options={DASHBOARD_TEMPLATE_OPTIONS} labelKey="label" valueKey="template" onChange={(value) => dashboard.selectTemplate(String(value))}
      sx={{ minWidth: 210 }} />}
  </Stack>;

  return <Box sx={{ width: 1 }} data-dashboard-source={dashboard.source}>
    <DashboardTemplateView data={data} permissions={dashboard.permissions} enforcePermissions
      loadingZones={dashboard.initializing ? Object.values(DASHBOARD_ZONE_KEYS) : dashboard.loadingZones}
      zoneErrors={dashboard.zoneErrors} onRetry={dashboard.retry} isRefreshing={dashboard.isRefreshing}
      contextAction={contextControls} blockedMessage={dashboard.blockedMessage}
      headerAction={firstAction && !dashboard.blockedMessage ? <Button component={NextLink}
        href={toSafeDashboardHref(firstAction.drilldownUrl)!} size="small" color="inherit" variant="contained">
        {firstAction.actionLabel || 'Review priorities'}
      </Button> : undefined}
      notification={<Stack spacing={1}>
        {isPreview && <Alert severity="info">Dashboard preview uses sample data.</Alert>}
        {dashboard.globalError && <Alert severity="warning" data-testid="dashboard-data-source-error"
          action={dashboard.retry && <Button size="small" color="inherit" onClick={dashboard.retry}>Retry</Button>}>
          {dashboard.globalError}
        </Alert>}
      </Stack>} />
  </Box>;
}
