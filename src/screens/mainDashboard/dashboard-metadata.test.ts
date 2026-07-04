import { it, expect, describe } from 'vitest';

import { DASHBOARD_ZONE_KEYS } from './dashboard-types';
import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import {
  normalizeDashboardWidgetMetadata,
  mergeDashboardWidgetMetadataWithFallback,
} from './dashboard-metadata';

describe('dashboard metadata', () => {
  it('normalizes backend widget metadata into registry entries', () => {
    const registry = normalizeDashboardWidgetMetadata([
      {
        id: 'finance-collection',
        zone: DASHBOARD_ZONE_KEYS.kpis,
        drilldownUrl: '/finance/fee-collection',
        requiredPermissions: ['ShikshaMitra.Module.Finance.Fees.FeeCollections.View'],
      },
    ]);

    expect(registry['finance-collection']).toMatchObject({
      id: 'finance-collection',
      zone: DASHBOARD_ZONE_KEYS.kpis,
      drilldownUrl: '/finance/fee-collection',
      requiredPermissions: ['ShikshaMitra.Module.Finance.Fees.FeeCollections.View'],
    });
  });

  it('drops invalid zones, missing permissions, and unsafe drilldowns', () => {
    const registry = normalizeDashboardWidgetMetadata([
      {
        id: 'wrong-zone',
        zone: 'unknown',
        drilldownUrl: '/dashboard',
        requiredPermissions: ['Permission.View'],
      },
      {
        id: 'missing-permission',
        zone: DASHBOARD_ZONE_KEYS.kpis,
        drilldownUrl: '/dashboard',
        requiredPermissions: [],
      },
      {
        id: 'unsafe-url',
        zone: DASHBOARD_ZONE_KEYS.kpis,
        drilldownUrl: 'https://example.com',
        requiredPermissions: ['Permission.View'],
      },
      {
        id: 'protocol-relative-url',
        zone: DASHBOARD_ZONE_KEYS.kpis,
        drilldownUrl: '//example.com',
        requiredPermissions: ['Permission.View'],
      },
    ]);

    expect(registry['wrong-zone']).toBeUndefined();
    expect(registry['missing-permission']).toBeUndefined();
    expect(registry['unsafe-url']).toMatchObject({
      id: 'unsafe-url',
      drilldownUrl: undefined,
    });
    expect(registry['protocol-relative-url']).toMatchObject({
      id: 'protocol-relative-url',
      drilldownUrl: undefined,
    });
  });

  it('lets backend metadata override local registry while keeping fallback entries', () => {
    const merged = mergeDashboardWidgetMetadataWithFallback({
      'finance-collection': {
        id: 'finance-collection',
        zone: DASHBOARD_ZONE_KEYS.kpis,
        drilldownUrl: '/backend-finance',
        requiredPermissions: ['Backend.Permission'],
      },
    });

    expect(merged['finance-collection'].drilldownUrl).toBe('/backend-finance');
    expect(merged['finance-dues']).toBe(dashboardWidgetRegistry['finance-dues']);
  });
});
