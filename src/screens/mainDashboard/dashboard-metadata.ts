import type { PermissionName } from 'src/utils/permissions';
import type { DashboardWidgetMetadataResponse } from 'src/redux/dashboard/dashboardApi';

import { DASHBOARD_ZONE_KEYS, type DashboardZoneKey } from './dashboard-types';
import {
  dashboardWidgetRegistry,
  type DashboardWidgetRegistry,
  type DashboardWidgetRegistryEntry,
} from './dashboard-widget-registry';

const allowedDashboardZones = new Set<string>(Object.values(DASHBOARD_ZONE_KEYS));

const toSafeDrilldownUrl = (value: unknown) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : undefined;

const toRequiredPermissions = (value: unknown): PermissionName | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const permissions = value.filter(
    (permission): permission is string =>
      typeof permission === 'string' && Boolean(permission.trim())
  );

  return permissions.length ? permissions : undefined;
};

export const normalizeDashboardWidgetMetadata = (
  payload: DashboardWidgetMetadataResponse[] | null | undefined
): DashboardWidgetRegistry => {
  if (!Array.isArray(payload)) {
    return {};
  }

  return payload.reduce<DashboardWidgetRegistry>((registry, item) => {
    if (!item || typeof item.id !== 'string' || !item.id.trim()) {
      return registry;
    }

    if (typeof item.zone !== 'string' || !allowedDashboardZones.has(item.zone)) {
      return registry;
    }

    const requiredPermissions = toRequiredPermissions(item.requiredPermissions);
    if (!requiredPermissions) {
      return registry;
    }

    const entry: DashboardWidgetRegistryEntry = {
      id: item.id,
      zone: item.zone as DashboardZoneKey,
      requiredPermissions,
      drilldownUrl: toSafeDrilldownUrl(item.drilldownUrl),
      owner: typeof item.owner === 'string' && item.owner.trim() ? item.owner.trim() : undefined,
    };

    registry[entry.id] = entry;
    return registry;
  }, {});
};

export const mergeDashboardWidgetMetadataWithFallback = (
  metadata: DashboardWidgetRegistry | undefined,
  fallback: DashboardWidgetRegistry = dashboardWidgetRegistry
): DashboardWidgetRegistry => ({
  ...fallback,
  ...(metadata ?? {}),
});
