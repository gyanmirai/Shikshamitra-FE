import type {
  PolicyStatus,
  HrPolicyType,
  PayrollPolicy,
  HrPolicyVersion,
  AttendancePolicy,
  HrPolicyAssignment,
  WorkCalendarPolicy,
  WorkCalendarHoliday,
  EditablePolicyStatus,
  HrPolicyImpactPreview,
  HrPolicyVersionCompare,
  HrPolicyAssignmentConflict,
} from 'src/redux/hr/hr-policy-api';

// --- Navigation --------------------------------------------------------------

export type WorkspaceTab =
  | 'calendars'
  | 'payroll'
  | 'attendance'
  | 'leave'
  | 'assignments'
  | 'holiday'
  | 'effective';

// --- Drawer -------------------------------------------------------------------

export type PolicyAssignmentTargetType = 'employee' | 'group';
export type DrawerKind = 'calendar' | 'payroll' | 'attendance' | 'assignment';
export type PolicyArchiveView = 'current' | 'archived';

export type HRPolicyWorkspaceProps = {
  focus?: WorkspaceTab;
};

export type DrawerState = {
  kind: DrawerKind;
  mode: 'create' | 'edit';
  item?: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy | HrPolicyAssignment;
} | null;

// --- Operations ---------------------------------------------------------------

export type PendingImpactAction = {
  label: string;
  run: (token?: string) => Promise<void>;
} | null;

export type PolicyOperationKey =
  | 'clone-policy'
  | 'restore-version'
  | 'save-calendar'
  | 'save-payroll'
  | 'save-attendance'
  | 'save-assignment'
  | 'delete-assignment'
  | 'archive-policy'
  | 'unarchive-policy'
  | 'set-default'
  | 'preview-impact'
  | 'confirm-impact';

export type PolicyOperationState = {
  key: PolicyOperationKey;
  title: string;
  message: string;
} | null;

// --- Audit & Versioning -------------------------------------------------------

export type AuditTarget = {
  entityType: string;
  entityId: string;
  title: string;
  policyType?: HrPolicyType;
  policyId?: string;
} | null;

export type VersionTarget = {
  policyType: HrPolicyType;
  policyId: string;
  policyName: string;
} | null;

export type RestoreVersionState = {
  version: HrPolicyVersion;
  name: string;
  reason: string;
} | null;

export type VersionDifference = HrPolicyVersionCompare['differences'][number];

// --- Forms --------------------------------------------------------------------

export type WorkCalendarForm = {
  name: string;
  status: EditablePolicyStatus;
  effectiveFrom: string;
  effectiveTo: string;
  weeklyOffPattern: string;
  customWeeklyOffs: number[];
  holidaySyncMode: string;
  holidays: WorkCalendarHoliday[];
};

export type ManualHolidayForm = {
  holidayName: string;
  fromDate: string;
  toDate: string;
  notes: string;
};

export type HolidayReviewFilter = 'all' | 'included' | 'removed' | 'central_calendar' | 'manual';

export type PayrollForm = {
  name: string;
  status: EditablePolicyStatus;
  workCalendarPolicyId: string;
  isDefault: boolean;
  dayCalculationType: string;
  manualMonthDays: Record<string, string>;
  saturdayWorkPolicy: string;
};

export type AttendanceAdvancedKey =
  | 'absentThresholdPercentage'
  | 'graceTime'
  | 'maxLateAllowedPerMonth'
  | 'penaltyType'
  | 'penaltyCountThreshold'
  | 'earlyExitEnabled'
  | 'earlyExitGraceTime'
  | 'overtimeEnabled'
  | 'overtimeRate'
  | 'minOvertimeMinutes'
  | 'holidayWorkBehavior'
  | 'sandwichRuleEnabled'
  | 'payrollPreviewEnabled';

export type AttendanceForm = {
  name: string;
  status: EditablePolicyStatus;
  workCalendarPolicyId: string;
  isDefault: boolean;
  captureMode: 'manual_status' | 'manual_with_time' | 'integrated';
  fullDayThresholdPercentage: string;
  halfDayThresholdPercentage: string;
  absentThresholdPercentage: string;
  missingPunchBehavior: string;
  manualCorrectionAllowed: boolean;
  graceTime: string;
  maxLateAllowedPerMonth: string;
  penaltyType: string;
  penaltyCountThreshold: string;
  earlyExitEnabled: boolean;
  earlyExitGraceTime: string;
  overtimeEnabled: boolean;
  overtimeRate: string;
  minOvertimeMinutes: string;
  holidayWorkBehavior: string;
  sandwichRuleEnabled: boolean;
  payrollPreviewEnabled: boolean;
};

export type AssignmentForm = {
  targetType: PolicyAssignmentTargetType;
  targetKey: string;
  targetDisplayName: string;
  payrollPolicyId: string;
  attendancePolicyId: string;
  effectiveFrom: string;
  effectiveTo: string;
  priority: string;
  assignmentReason: string;
  isActive: boolean;
};

export type AssignmentFilters = {
  search: string;
  targetType: 'all' | PolicyAssignmentTargetType;
  status: 'all' | 'active' | 'inactive';
  payrollPolicyId: string;
  attendancePolicyId: string;
  activeOnDate: string;
  effectiveFrom: string;
  effectiveTo: string;
};

// --- Lookup helpers -----------------------------------------------------------

export type LookupOption = {
  id?: string;
  userId?: string | null;
  name?: string;
  displayName?: string;
  employeeName?: string;
  fullName?: string;
  shiftName?: string;
  userName?: string;
  department?: string | null;
  organizationNames?: string[];
  organizations?: Array<{ id?: string; name?: string | null }>;
  memberCount?: number;
  employeeCount?: number;
};

export type AssignmentTableRow = {
  id: string;
  assignment: HrPolicyAssignment;
  target: string;
  targetKey: string;
  organization: string;
  sourceType: string;
  payrollPolicyName: string;
  attendancePolicyName: string;
  effective: string;
  priority: number;
  status: string;
  reason: string;
};

// Re-export HR API types used across this feature so callers only need one import
export type {
  PolicyStatus,
  HrPolicyType,
  PayrollPolicy,
  HrPolicyVersion,
  AttendancePolicy,
  HrPolicyAssignment,
  WorkCalendarPolicy,
  WorkCalendarHoliday,
  EditablePolicyStatus,
  HrPolicyImpactPreview,
  HrPolicyAssignmentConflict,
};
