import { toSafeDashboardHref } from './dashboard-navigation';
import { isDashboardTemplate } from './dashboard-template-resolver';
import {
  type DashboardWidgetRegistry,
  enrichDashboardDataFromRegistry,
} from './dashboard-widget-registry';
import { parseDashboardFocus, parseDashboardPersonalContext, parseDashboardPresentationRole } from './dashboard-focus-adapter';
import {
  DASHBOARD_ZONE_KEYS,
  DASHBOARD_TEMPLATES,
  type DashboardWidget,
  type DashboardTemplate,
  type DashboardDateRange,
  type DashboardActionItem,
  type DashboardZoneErrors,
  type DashboardDataContract,
  type DashboardModuleSnapshot,
} from './dashboard-types';

type DashboardPayload = {
  presentationRole?: unknown;
  students?: unknown;
  selectedStudentId?: unknown;
  focus?: unknown;
  dashboardTemplate?: unknown;
  academicYearId?: unknown;
  dateRange?: unknown;
  kpiCards?: unknown;
  actionItems?: unknown;
  riskAlerts?: unknown;
  calendarItems?: unknown;
  moduleSnapshots?: unknown;
  announcements?: unknown;
  scopeLabel?: unknown;
  dataState?: unknown;
  generatedAtUtc?: unknown;
};

type DashboardPayloadWithZoneErrors = DashboardPayload & {
  zoneErrors?: Record<string, string>;
};

export type AdaptedDashboardPayloadResult = {
  data: DashboardDataContract;
  zoneErrors: DashboardZoneErrors;
};

const toWidget = (value: any): DashboardWidget | null => {
  if (!value || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null;
  }

  return {
    ...value,
    drilldownUrl: toSafeDashboardHref(value.drilldownUrl),
  };
};

const toWidgetList = <T extends DashboardWidget>(value: unknown): T[] =>
  Array.isArray(value) ? (value.map(toWidget).filter(Boolean) as T[]) : [];

const toDashboardDateRange = (value: unknown): DashboardDateRange => {
  if (!value || typeof value !== 'object') {
    return { label: 'Today' };
  }

  const dateRange = value as Partial<DashboardDateRange>;

  return {
    label:
      typeof dateRange.label === 'string' && dateRange.label.trim() ? dateRange.label : 'Today',
    ...(typeof dateRange.from === 'string' ? { from: dateRange.from } : {}),
    ...(typeof dateRange.to === 'string' ? { to: dateRange.to } : {}),
  };
};

const toDashboardZoneErrors = (value: unknown): DashboardZoneErrors => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const allowedZones = new Set<string>(Object.values(DASHBOARD_ZONE_KEYS));

  return Object.entries(value).reduce<DashboardZoneErrors>((zoneErrors, [key, message]) => {
    if (allowedZones.has(key) && typeof message === 'string' && message.trim()) {
      zoneErrors[key as keyof DashboardZoneErrors] = message.trim();
    }

    return zoneErrors;
  }, {});
};

export function mapDashboardPayload(
  payload: DashboardPayload | null | undefined,
  fallbackTemplate: DashboardTemplate = DASHBOARD_TEMPLATES.principalAdmin
): DashboardDataContract {
  const dashboardTemplate = isDashboardTemplate(payload?.dashboardTemplate)
    ? payload.dashboardTemplate
    : fallbackTemplate;

  return {
    dashboardTemplate,
    presentationRole: parseDashboardPresentationRole(payload?.presentationRole),
    ...parseDashboardPersonalContext(payload),
    focus: parseDashboardFocus(payload?.focus),
    academicYearId:
      typeof payload?.academicYearId === 'string' ? payload.academicYearId : undefined,
    dateRange: toDashboardDateRange(payload?.dateRange),
    scopeLabel: typeof payload?.scopeLabel === 'string' ? payload.scopeLabel : undefined,
    dataState: payload?.dataState === 'partial' ? 'partial' : 'live',
    generatedAtUtc:
      typeof payload?.generatedAtUtc === 'string' ? payload.generatedAtUtc : undefined,
    kpiCards: toWidgetList(payload?.kpiCards),
    actionItems: toWidgetList<DashboardActionItem>(payload?.actionItems),
    riskAlerts: toWidgetList<DashboardActionItem>(payload?.riskAlerts),
    calendarItems: toWidgetList<DashboardActionItem>(payload?.calendarItems),
    moduleSnapshots: toWidgetList<DashboardModuleSnapshot>(payload?.moduleSnapshots),
    announcements: toWidgetList<DashboardActionItem>(payload?.announcements),
  };
}

export function adaptDashboardPayload(
  payload: DashboardPayload | null | undefined,
  fallbackTemplate: DashboardTemplate = DASHBOARD_TEMPLATES.principalAdmin,
  registry?: DashboardWidgetRegistry
): DashboardDataContract {
  return enrichDashboardDataFromRegistry(mapDashboardPayload(payload, fallbackTemplate), registry, !payload?.presentationRole);
}

export function adaptDashboardSummaryPayload(
  payload: DashboardPayloadWithZoneErrors | null | undefined,
  fallbackTemplate: DashboardTemplate = DASHBOARD_TEMPLATES.principalAdmin,
  registry?: DashboardWidgetRegistry
): AdaptedDashboardPayloadResult {
  return {
    data: adaptDashboardPayload(payload, fallbackTemplate, registry),
    zoneErrors: toDashboardZoneErrors(payload?.zoneErrors),
  };
}
