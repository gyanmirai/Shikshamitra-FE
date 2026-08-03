'use client';

import type { GrantedPermission } from 'src/utils/permissions';

import { useMemo } from 'react';
import { Grid } from '@mui/material';

import { DashboardZone } from './dashboard-zone';
import { DashboardShell } from './dashboard-shell';
import { filterDashboardDataByPermissions } from './dashboard-permissions';
import { DashboardWidgetGrid } from './dashboard-widget-card';
import {
  DASHBOARD_TEMPLATES,
  DASHBOARD_ZONE_KEYS,
  DASHBOARD_TEMPLATE_META,
  type DashboardTemplate,
  type DashboardZoneKey,
  type DashboardZoneErrors,
  type DashboardDataContract,
} from './dashboard-types';

type RoleDashboardViewProps = {
  data: DashboardDataContract;
  permissions: GrantedPermission[];
  enforcePermissions: boolean;
  loadingZones?: DashboardZoneKey[];
  zoneErrors?: DashboardZoneErrors;
  onRetry?: () => void;
};

type RoleLayout = {
  prioritiesFirst: boolean;
  actionTitle: string;
  actionDescription: string;
  riskTitle: string;
  moduleTitle: string;
};

const ROLE_LAYOUTS: Record<DashboardTemplate, RoleLayout> = {
  [DASHBOARD_TEMPLATES.leadership]: {
    prioritiesFirst: false,
    actionTitle: 'Priority decisions',
    actionDescription: 'Approvals and reviews that need leadership attention.',
    riskTitle: 'Risks and compliance',
    moduleTitle: 'School health by module',
  },
  [DASHBOARD_TEMPLATES.principalAdmin]: {
    prioritiesFirst: true,
    actionTitle: 'Today’s action queue',
    actionDescription: 'Operational work waiting for principal or administrative follow-up.',
    riskTitle: 'Exceptions to watch',
    moduleTitle: 'Operational health',
  },
  [DASHBOARD_TEMPLATES.teacher]: {
    prioritiesFirst: true,
    actionTitle: 'My next actions',
    actionDescription: 'Attendance, review, and class work ordered for your day.',
    riskTitle: 'Students needing follow-up',
    moduleTitle: 'My class health',
  },
  [DASHBOARD_TEMPLATES.financeHr]: {
    prioritiesFirst: true,
    actionTitle: 'Finance and HR queue',
    actionDescription: 'Only work permitted for your finance or people-operations role.',
    riskTitle: 'Month-close risks',
    moduleTitle: 'Finance and workforce health',
  },
  [DASHBOARD_TEMPLATES.studentParent]: {
    prioritiesFirst: false,
    actionTitle: 'What needs attention',
    actionDescription: 'Personal actions for the linked student record.',
    riskTitle: 'Important alerts',
    moduleTitle: 'Academic overview',
  },
};

export default function DashboardTemplateView({
  data,
  permissions,
  enforcePermissions,
  loadingZones = [],
  zoneErrors = {},
  onRetry,
}: RoleDashboardViewProps) {
  const filteredData = useMemo(
    () => filterDashboardDataByPermissions(data, permissions, { enforcePermissions }),
    [data, permissions, enforcePermissions]
  );
  const layout = ROLE_LAYOUTS[filteredData.dashboardTemplate];
  const templateMeta = DASHBOARD_TEMPLATE_META[filteredData.dashboardTemplate];
  const isZoneLoading = (zone: DashboardZoneKey) => loadingZones.includes(zone);

  const metricZone = (
    <DashboardZone
      title={templateMeta.primaryZoneTitle}
      description="Current indicators across the period and scope shown above."
      testId="dashboard-zone-kpis"
      itemCount={filteredData.kpiCards.length}
      isEmpty={!filteredData.kpiCards.length}
      isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.kpis)}
      error={zoneErrors.kpis}
      onRetry={onRetry}
    >
      <DashboardWidgetGrid widgets={filteredData.kpiCards} kind="metric" featureFirst />
    </DashboardZone>
  );

  const priorityZones = (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <DashboardZone
          title={layout.actionTitle}
          description={layout.actionDescription}
          testId="dashboard-zone-actions"
          itemCount={filteredData.actionItems.length}
          isEmpty={!filteredData.actionItems.length}
          isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.actions)}
          error={zoneErrors.actions}
          onRetry={onRetry}
        >
          <DashboardWidgetGrid widgets={filteredData.actionItems} kind="action" />
        </DashboardZone>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <DashboardZone
          title={layout.riskTitle}
          description="Exceptions are shown only when your role can open the underlying workflow."
          testId="dashboard-zone-risks"
          itemCount={filteredData.riskAlerts.length}
          isEmpty={!filteredData.riskAlerts.length}
          isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.risks)}
          error={zoneErrors.risks}
          onRetry={onRetry}
        >
          <DashboardWidgetGrid widgets={filteredData.riskAlerts} kind="risk" />
        </DashboardZone>
      </Grid>
    </Grid>
  );

  return (
    <DashboardShell data={filteredData}>
      {layout.prioritiesFirst ? (
        <>
          {priorityZones}
          {metricZone}
        </>
      ) : (
        <>
          {metricZone}
          {priorityZones}
        </>
      )}

      <DashboardZone
        title={layout.moduleTitle}
        description="Open a module for the records and analysis behind each signal."
        testId="dashboard-zone-modules"
        itemCount={filteredData.moduleSnapshots.length}
        isEmpty={!filteredData.moduleSnapshots.length}
        isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.modules)}
        error={zoneErrors.modules}
        onRetry={onRetry}
      >
        <DashboardWidgetGrid widgets={filteredData.moduleSnapshots} kind="health" />
      </DashboardZone>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardZone
            title="Coming up"
            description="Events and deadlines relevant to your permitted school context."
            testId="dashboard-zone-calendar"
            itemCount={filteredData.calendarItems.length}
            isEmpty={!filteredData.calendarItems.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.calendar)}
            error={zoneErrors.calendar}
            onRetry={onRetry}
          >
            <DashboardWidgetGrid widgets={filteredData.calendarItems} kind="timeline" />
          </DashboardZone>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardZone
            title="School updates"
            description="Announcements that connect to a workflow you can access."
            testId="dashboard-zone-announcements"
            itemCount={filteredData.announcements.length}
            isEmpty={!filteredData.announcements.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.announcements)}
            error={zoneErrors.announcements}
            onRetry={onRetry}
          >
            <DashboardWidgetGrid widgets={filteredData.announcements} kind="announcement" />
          </DashboardZone>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
