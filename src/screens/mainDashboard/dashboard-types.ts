import type { PermissionName } from 'src/utils/permissions';

export const DASHBOARD_TEMPLATES = {
  leadership: 'leadership',
  principalAdmin: 'principalAdmin',
  teacher: 'teacher',
  financeHr: 'financeHr',
  studentParent: 'studentParent',
} as const;

export type DashboardTemplate = (typeof DASHBOARD_TEMPLATES)[keyof typeof DASHBOARD_TEMPLATES];

export type DashboardStatus = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export type DashboardWidgetKind =
  'metric' | 'action' | 'risk' | 'health' | 'timeline' | 'announcement';

export type DashboardPriority = 'low' | 'normal' | 'high' | 'critical';

export const DASHBOARD_ZONE_KEYS = {
  kpis: 'kpis',
  actions: 'actions',
  risks: 'risks',
  modules: 'modules',
  calendar: 'calendar',
  announcements: 'announcements',
} as const;

export type DashboardZoneKey = (typeof DASHBOARD_ZONE_KEYS)[keyof typeof DASHBOARD_ZONE_KEYS];

export type DashboardZoneErrors = Partial<Record<DashboardZoneKey, string>>;

export type DashboardDataSourceName =
  'api' | 'apiError' | 'mock' | 'contractPreview' | 'contractPreviewFallback';

export type DashboardWidget = {
  id: string;
  title: string;
  value?: string | number;
  count?: number;
  dueLabel?: string;
  subtitle?: string;
  status?: DashboardStatus;
  trend?: string;
  owner?: string;
  drilldownUrl?: string;
  requiredPermissions?: PermissionName;
  kind?: DashboardWidgetKind;
  priority?: DashboardPriority;
  actionLabel?: string;
  health?: 'good' | 'attention' | 'critical';
};

export type DashboardActionItem = DashboardWidget & {
  count?: number;
  dueLabel?: string;
};

export type DashboardModuleSnapshot = DashboardWidget;

export type DashboardDateRange = {
  label: string;
  from?: string;
  to?: string;
};

export type DashboardDataContract = {
  dashboardTemplate: DashboardTemplate;
  academicYearId?: string;
  dateRange: DashboardDateRange;
  scopeLabel?: string;
  dataState?: 'live' | 'partial';
  generatedAtUtc?: string;
  kpiCards: DashboardWidget[];
  actionItems: DashboardActionItem[];
  riskAlerts: DashboardActionItem[];
  calendarItems: DashboardActionItem[];
  moduleSnapshots: DashboardModuleSnapshot[];
  announcements: DashboardActionItem[];
};

export type DashboardDataSourceResult = {
  data: DashboardDataContract;
  isLoading: boolean;
  loadingZones: DashboardZoneKey[];
  zoneErrors: DashboardZoneErrors;
  source: DashboardDataSourceName;
  globalError?: string;
  retry?: () => void;
};

export type DashboardTemplateMeta = {
  template: DashboardTemplate;
  label: string;
  description: string;
  eyebrow: string;
  primaryZoneTitle: string;
};

export const DASHBOARD_TEMPLATE_META: Record<DashboardTemplate, DashboardTemplateMeta> = {
  [DASHBOARD_TEMPLATES.leadership]: {
    template: DASHBOARD_TEMPLATES.leadership,
    label: 'Leadership',
    description: 'Whole-school health, finance, growth, compliance, and major risks.',
    eyebrow: 'Whole-school command center',
    primaryZoneTitle: 'School pulse',
  },
  [DASHBOARD_TEMPLATES.principalAdmin]: {
    template: DASHBOARD_TEMPLATES.principalAdmin,
    label: 'Principal/Admin',
    description: 'Daily school operations across academics, attendance, safety, and communication.',
    eyebrow: 'Today’s operations',
    primaryZoneTitle: 'Operational pulse',
  },
  [DASHBOARD_TEMPLATES.teacher]: {
    template: DASHBOARD_TEMPLATES.teacher,
    label: 'Teacher',
    description: 'Classes, attendance, homework, exams, student risks, and communication.',
    eyebrow: 'My teaching day',
    primaryZoneTitle: 'Teaching pulse',
  },
  [DASHBOARD_TEMPLATES.financeHr]: {
    template: DASHBOARD_TEMPLATES.financeHr,
    label: 'Finance/HR',
    description: 'Fee health, payroll readiness, staff attendance, leave, and HR actions.',
    eyebrow: 'Finance and people operations',
    primaryZoneTitle: 'Finance and workforce pulse',
  },
  [DASHBOARD_TEMPLATES.studentParent]: {
    template: DASHBOARD_TEMPLATES.studentParent,
    label: 'Student/Parent',
    description: 'Personal academic, attendance, fee, transport, and school communication.',
    eyebrow: 'My school day',
    primaryZoneTitle: 'Personal overview',
  },
};

export const DASHBOARD_TEMPLATE_OPTIONS = Object.values(DASHBOARD_TEMPLATE_META);
