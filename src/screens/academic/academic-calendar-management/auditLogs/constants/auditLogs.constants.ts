// ─── Audit Intelligence Constants ──────────────────────────────────────────────

import {
  AuditSource,
  AuditRiskLevel,
  AuditImpactLevel,
  AuditApprovalStatus,
  type AuditFilterState,
} from '../types/auditLogs.types';

/** Empty filter state used for resets. */
export const EMPTY_FILTERS: AuditFilterState = {
  search: '',
  action: '',
  changedByUserId: '',
  changedByRole: '',
  impactLevel: '',
  source: '',
  entityType: '',
  entityId: '',
  hasDiff: '',
  reasonAvailable: '',
  approvalStatus: '',
  dateRange: '',
  fromDate: undefined,
  toDate: undefined,
};

// ─── Risk metadata ────────────────────────────────────────────────────────────

export const RISK_LABELS: Record<AuditRiskLevel, string> = {
  [AuditRiskLevel.Low]: 'Low',
  [AuditRiskLevel.Medium]: 'Medium',
  [AuditRiskLevel.High]: 'High',
  [AuditRiskLevel.Critical]: 'Critical',
};

export const RISK_COLOR_KEYS: Record<AuditRiskLevel, 'success' | 'info' | 'warning' | 'error'> = {
  [AuditRiskLevel.Low]: 'success',
  [AuditRiskLevel.Medium]: 'info',
  [AuditRiskLevel.High]: 'warning',
  [AuditRiskLevel.Critical]: 'error',
};

export const RISK_ICONS: Record<AuditRiskLevel, string> = {
  [AuditRiskLevel.Low]: 'mdi:shield-check-outline',
  [AuditRiskLevel.Medium]: 'mdi:shield-half-full',
  [AuditRiskLevel.High]: 'mdi:alert-outline',
  [AuditRiskLevel.Critical]: 'mdi:alert-octagon-outline',
};

export const RISK_EXPLANATIONS: Record<AuditRiskLevel, string> = {
  [AuditRiskLevel.Low]: 'Routine change with little to no academic disruption.',
  [AuditRiskLevel.Medium]: 'Noticeable change that may affect planning.',
  [AuditRiskLevel.High]: 'Modified a published calendar and may affect timetable or exams.',
  [AuditRiskLevel.Critical]:
    'Severe change — deletion, rollback, or disruption to a live academic year.',
};

export const RISK_OPTIONS = [
  { label: 'All Risks', value: '' },
  ...Object.values(AuditRiskLevel)
    .filter((v) => typeof v === 'number')
    .map((v) => ({ label: RISK_LABELS[v as AuditRiskLevel], value: String(v) })),
];

// ─── Impact metadata ──────────────────────────────────────────────────────────

export const IMPACT_LABELS: Record<AuditImpactLevel, string> = {
  [AuditImpactLevel.None]: 'No Impact',
  [AuditImpactLevel.Minor]: 'Minor Impact',
  [AuditImpactLevel.Academic]: 'Academic Impact',
  [AuditImpactLevel.High]: 'High Impact',
};

export const IMPACT_COLOR_KEYS: Record<AuditImpactLevel, 'default' | 'info' | 'warning' | 'error'> =
  {
    [AuditImpactLevel.None]: 'default',
    [AuditImpactLevel.Minor]: 'info',
    [AuditImpactLevel.Academic]: 'warning',
    [AuditImpactLevel.High]: 'error',
  };

// ─── Source metadata ──────────────────────────────────────────────────────────

export const SOURCE_LABELS: Record<AuditSource, string> = {
  [AuditSource.Web]: 'Web',
  [AuditSource.Mobile]: 'Mobile',
  [AuditSource.API]: 'API',
  [AuditSource.BulkUpload]: 'Bulk Upload',
  [AuditSource.SystemJob]: 'System',
};

export const SOURCE_ICONS: Record<AuditSource, string> = {
  [AuditSource.Web]: 'mdi:web',
  [AuditSource.Mobile]: 'mdi:cellphone',
  [AuditSource.API]: 'mdi:api',
  [AuditSource.BulkUpload]: 'mdi:upload-multiple',
  [AuditSource.SystemJob]: 'mdi:cog-clockwise-outline',
};

export const SOURCE_COLOR_KEYS: Record<
  AuditSource,
  'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'default'
> = {
  [AuditSource.Web]: 'primary',
  [AuditSource.Mobile]: 'secondary',
  [AuditSource.API]: 'info',
  [AuditSource.BulkUpload]: 'warning',
  [AuditSource.SystemJob]: 'default',
};

export const SOURCE_OPTIONS = [
  { label: 'All Sources', value: '' },
  ...Object.values(AuditSource)
    .filter((v) => typeof v === 'number')
    .map((v) => ({ label: SOURCE_LABELS[v as AuditSource], value: String(v) })),
];

// ─── Approval metadata ────────────────────────────────────────────────────────

export const APPROVAL_LABELS: Record<AuditApprovalStatus, string> = {
  [AuditApprovalStatus.NotRequired]: 'Not Required',
  [AuditApprovalStatus.PendingApproval]: 'Pending Approval',
  [AuditApprovalStatus.Approved]: 'Approved',
  [AuditApprovalStatus.Rejected]: 'Rejected',
  [AuditApprovalStatus.AutoApproved]: 'Auto Approved',
};

export const APPROVAL_COLOR_KEYS: Record<
  AuditApprovalStatus,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  [AuditApprovalStatus.NotRequired]: 'default',
  [AuditApprovalStatus.PendingApproval]: 'warning',
  [AuditApprovalStatus.Approved]: 'success',
  [AuditApprovalStatus.Rejected]: 'error',
  [AuditApprovalStatus.AutoApproved]: 'info',
};

export const APPROVAL_OPTIONS = [
  { label: 'All Approval Status', value: '' },
  ...Object.values(AuditApprovalStatus)
    .filter((v) => typeof v === 'number')
    .map((v) => ({
      label: APPROVAL_LABELS[v as AuditApprovalStatus],
      value: String(v),
    })),
];

// ─── Impact category rows for impact panel ────────────────────────────────────

export const IMPACT_CATEGORY_ROWS = [
  { key: 'workingDaysAffected', label: 'Working Days', icon: 'mdi:calendar-check-outline' },
  { key: 'holidaysAffected', label: 'Holidays', icon: 'mdi:flag-outline' },
  { key: 'eventsAffected', label: 'Events', icon: 'mdi:party-popper' },
  { key: 'timetablesAffected', label: 'Timetables', icon: 'mdi:calendar-clock-outline' },
  { key: 'lecturesAffected', label: 'Lectures', icon: 'mdi:presentation-play' },
  { key: 'examsAffected', label: 'Exams', icon: 'mdi:file-document-edit-outline' },
  { key: 'assignmentsAffected', label: 'Assignments', icon: 'mdi:clipboard-list-outline' },
  { key: 'studentsAffected', label: 'Students', icon: 'mdi:school-outline' },
  { key: 'staffAffected', label: 'Staff', icon: 'mdi:account-tie-outline' },
  { key: 'transportRoutesAffected', label: 'Transport Routes', icon: 'mdi:bus' },
  { key: 'hostelActivitiesAffected', label: 'Hostel Activities', icon: 'mdi:bed-outline' },
] as const;

// ─── Filter dropdowns ─────────────────────────────────────────────────────────

export const DATE_RANGE_OPTIONS = [
  { label: 'Any Date', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Custom Range', value: 'custom' },
];

export const HAS_DIFF_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Has Diff', value: 'true' },
  { label: 'No Diff', value: 'false' },
];

export const REASON_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Reason Available', value: 'true' },
  { label: 'Reason Missing', value: 'false' },
];

export const ENTITY_TYPE_OPTIONS = [
  { label: 'All Entities', value: '' },
  { label: 'Academic Calendar', value: 'AcademicCalendar' },
  { label: 'Holiday', value: 'Holiday' },
  { label: 'Event', value: 'Event' },
  { label: 'Emergency Closure', value: 'EmergencyClosure' },
  { label: 'Setting', value: 'Setting' },
  { label: 'Working Day', value: 'WorkingDay' },
];

export const ROLE_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SuperAdmin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Principal', value: 'Principal' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Academic Admin', value: 'AcademicAdmin' },
];

// ─── Default saved filters (demo presets) ─────────────────────────────────────

export const DEFAULT_SAVED_FILTERS = [
  {
    id: 'preset-pending-approval',
    name: 'Pending Approval Logs',
    filters: {
      ...EMPTY_FILTERS,
      approvalStatus: String(AuditApprovalStatus.PendingApproval),
    },
  },
  {
    id: 'preset-holiday-updates',
    name: 'Holiday Updates',
    filters: { ...EMPTY_FILTERS, entityType: 'Holiday' },
  },
];

// ─── Sensitive actions that require a reason ──────────────────────────────────

export const SENSITIVE_ACTIONS_REQUIRING_REASON = new Set<string>([
  'Calendar Deleted',
  'Published Calendar Updated',
  'Holiday Removed',
  'Working Day Changed',
  'Emergency Closure Added',
  'Emergency Closure Removed',
  'Calendar Unpublished',
  'Bulk Update',
  'Rollback Performed',
]);

/** Keyboard shortcut hints shown in tooltips. */
export const KEYBOARD_SHORTCUTS = [
  { key: '/', description: 'Focus search' },
  { key: 'F', description: 'Open filters' },
  { key: 'E', description: 'Export' },
  { key: 'T', description: 'Toggle table/timeline' },
  { key: 'A', description: 'Open AI summary' },
  { key: 'Esc', description: 'Close drawer' },
];
