'use client';

import type { GrantedPermission } from 'src/utils/permissions';

import { useMemo } from 'react';
import { Grid, Stack } from '@mui/material';

import { DashboardZone } from './dashboard-zone';
import { DashboardShell } from './dashboard-shell';
import { filterDashboardDataByPermissions } from './dashboard-permissions';
import { DashboardWidgetCard, DashboardWidgetGrid } from './dashboard-widget-card';
import {
  DASHBOARD_ZONE_KEYS,
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
};

export default function DashboardTemplateView({
  data,
  permissions,
  enforcePermissions,
  loadingZones = [],
  zoneErrors = {},
}: RoleDashboardViewProps) {
  const filteredData = useMemo(
    () => filterDashboardDataByPermissions(data, permissions, { enforcePermissions }),
    [data, permissions, enforcePermissions]
  );
  const isZoneLoading = (zone: DashboardZoneKey) => loadingZones.includes(zone);

  return (
    <DashboardShell data={filteredData}>
      <DashboardZone
        title="School Pulse"
        testId="dashboard-zone-kpis"
        isEmpty={!filteredData.kpiCards.length}
        isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.kpis)}
        error={zoneErrors.kpis}
      >
        <DashboardWidgetGrid widgets={filteredData.kpiCards} />
      </DashboardZone>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DashboardZone
            title="Action Queue"
            testId="dashboard-zone-actions"
            isEmpty={!filteredData.actionItems.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.actions)}
            error={zoneErrors.actions}
          >
            <DashboardWidgetGrid widgets={filteredData.actionItems} compact />
          </DashboardZone>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardZone
            title="Risks And Compliance"
            testId="dashboard-zone-risks"
            isEmpty={!filteredData.riskAlerts.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.risks)}
            error={zoneErrors.risks}
          >
            <DashboardWidgetGrid widgets={filteredData.riskAlerts} compact />
          </DashboardZone>
        </Grid>
      </Grid>

      <DashboardZone
        title="Module Drilldowns"
        testId="dashboard-zone-modules"
        isEmpty={!filteredData.moduleSnapshots.length}
        isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.modules)}
        error={zoneErrors.modules}
      >
        <DashboardWidgetGrid widgets={filteredData.moduleSnapshots} compact />
      </DashboardZone>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardZone
            title="Calendar"
            testId="dashboard-zone-calendar"
            isEmpty={!filteredData.calendarItems.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.calendar)}
            error={zoneErrors.calendar}
          >
            <Stack spacing={1}>
              {filteredData.calendarItems.map((item) => (
                <DashboardWidgetCard key={item.id} widget={item} compact />
              ))}
            </Stack>
          </DashboardZone>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardZone
            title="Announcements"
            testId="dashboard-zone-announcements"
            isEmpty={!filteredData.announcements.length}
            isLoading={isZoneLoading(DASHBOARD_ZONE_KEYS.announcements)}
            error={zoneErrors.announcements}
          >
            <Stack spacing={1}>
              {filteredData.announcements.map((item) => (
                <DashboardWidgetCard key={item.id} widget={item} compact />
              ))}
            </Stack>
          </DashboardZone>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
