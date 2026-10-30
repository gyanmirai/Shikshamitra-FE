'use client';

import type { ReactNode } from 'react';
import type { GrantedPermission } from 'src/utils/permissions';

import { Box, Alert, Stack, Typography } from '@mui/material';

import { DashboardShell } from './dashboard-shell';
import { DashboardWorkList } from './dashboard-work-list';
import { DashboardFocusView } from './dashboard-focus-view';
import { DashboardWidgetGrid } from './dashboard-widget-card';
import { selectDashboardFocus } from './dashboard-focus-access';
import { DashboardMetricsRegion } from './dashboard-metrics-region';
import { filterDashboardDataByPermissions } from './dashboard-permissions';

import type { DashboardZoneKey, DashboardZoneErrors, DashboardDataContract } from './dashboard-types';

type Props = {
  data: DashboardDataContract; permissions: GrantedPermission[]; enforcePermissions: boolean;
  loadingZones?: DashboardZoneKey[]; zoneErrors?: DashboardZoneErrors; onRetry?: () => void;
  isRefreshing?: boolean; contextAction?: ReactNode; headerAction?: ReactNode;
  blockedMessage?: string; notification?: ReactNode;
};

export default function DashboardTemplateView({ data, permissions, enforcePermissions, loadingZones = [],
  zoneErrors = {}, onRetry, isRefreshing, contextAction, headerAction, blockedMessage, notification }: Props) {
  const filtered = filterDashboardDataByPermissions(data, permissions, { enforcePermissions });
  const focus = selectDashboardFocus(filtered, permissions, enforcePermissions);
  const personal = filtered.dashboardTemplate === 'studentParent';
  const loading = (zone: DashboardZoneKey) => loadingZones.includes(zone);
  const selectionRequired = personal && Boolean(filtered.students?.length) && !filtered.selectedStudentId;
  return <DashboardShell data={filtered} presentationRole={filtered.presentationRole} onRefresh={onRetry}
    isRefreshing={isRefreshing} headerAction={headerAction} contextAction={contextAction}>
    {notification}
    {blockedMessage ? <Alert severity="info">{blockedMessage}</Alert> : <>
      <DashboardMetricsRegion widgets={filtered.kpiCards} isLoading={loading('kpis')} error={zoneErrors.kpis} onRetry={onRetry} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.65fr) minmax(0,1fr)' }, gap: 2 }}>
        <Box data-testid="dashboard-zone-focus" sx={{ minWidth: 0 }}>
          {selectionRequired ? <Alert severity="info">Select a linked student to view their dashboard.</Alert> :
            <DashboardFocusView focus={focus} isLoading={loading('kpis')}
              onRetry={focus?.status === 'error' ? onRetry : undefined} isRefreshing={isRefreshing} />}
        </Box>
        <DashboardWorkList widgets={filtered.actionItems} title={personal ? 'Needs Your Attention' : 'Priority Actions'}
          description="Workflows awaiting your review" testId="dashboard-zone-actions" isLoading={loading('actions')}
          error={zoneErrors.actions} onRetry={onRetry} emptyMessage="No priority actions are available for this period." />
      </Box>
      <Box data-testid="dashboard-zone-modules" sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h2" sx={{ px: 1, mb: 1.5 }}>{personal ? 'Personal Overview' : 'Across Your Modules'}</Typography>
        {loading('modules') ? <Typography data-testid="dashboard-zone-modules-loading">Loading module summaries...</Typography> :
          filtered.moduleSnapshots.length ? <DashboardWidgetGrid widgets={filtered.moduleSnapshots} kind="health" /> :
            !zoneErrors.modules && <Typography variant="body2" color="text.secondary" sx={{ px: 1 }} data-testid="dashboard-zone-modules-empty">
              No module summaries are available for this period.
            </Typography>}
        {zoneErrors.modules && <Alert severity="warning" data-testid="dashboard-zone-modules-error">{zoneErrors.modules}</Alert>}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
        <DashboardWorkList widgets={filtered.calendarItems} title="Coming Up" kind="timeline" testId="dashboard-zone-calendar"
          isLoading={loading('calendar')} error={zoneErrors.calendar} onRetry={onRetry} emptyMessage="No calendar items are available for this period." />
        <DashboardWorkList widgets={filtered.riskAlerts} title="Follow-up and Exceptions" kind="risk" testId="dashboard-zone-risks"
          isLoading={loading('risks')} error={zoneErrors.risks} onRetry={onRetry} emptyMessage="No exceptions are available for this period." />
      </Box>
      <Stack><DashboardWorkList widgets={filtered.announcements} title="School Updates" kind="announcement" testId="dashboard-zone-announcements"
        isLoading={loading('announcements')} error={zoneErrors.announcements} onRetry={onRetry} emptyMessage="No school updates are available for this period." /></Stack>
    </>}
  </DashboardShell>;
}
