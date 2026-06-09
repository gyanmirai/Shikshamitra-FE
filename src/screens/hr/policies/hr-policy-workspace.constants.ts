import dayjs from 'dayjs';

import type {
  PayrollForm,
  WorkspaceTab,
  AttendanceForm,
  AssignmentForm,
  WorkCalendarForm,
  AssignmentFilters,
  AttendanceAdvancedKey,
} from './types/hr-policy-workspace.types';
// Tab configuration
// --- Tab Configuration --------------------------------------------------------

export const HR_POLICY_TABS: Array<{
  value: WorkspaceTab;
  label: string;
  icon: string;
  disabled?: boolean;
}> = [
  { value: 'calendars', label: 'Work Calendars', icon: 'mdi:calendar-month-outline' },
  { value: 'payroll', label: 'Payroll Policies', icon: 'mdi:cash-sync' },
  { value: 'attendance', label: 'Attendance Policies', icon: 'mdi:account-clock-outline' },
  { value: 'assignments', label: 'Policy Assignments', icon: 'mdi:account-switch-outline' },
  { value: 'leave', label: 'Leave Policies', icon: 'mdi:calendar-text-outline' },
  {
    value: 'holiday',
    label: 'Holiday Impact',
    icon: 'mdi:calendar-search-outline',
    disabled: true,
  },
  { value: 'effective', label: 'Policy Impact', icon: 'mdi:source-branch-check' },
];
// Weekday and weekly-rule options
// --- Weekday / Weekly-Rule Options -------------------------------------------

export const WEEKDAY_OPTIONS = [
  { value: 0, short: 'Sun', label: 'Sunday' },
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
];

export const WEEKLY_RULE_OPTIONS = [
  { value: 'saturday_sunday', label: 'Saturday + Sunday Off' },
  { value: 'sunday', label: 'Sunday Off' },
  { value: 'custom', label: 'Custom' },
];
// Payroll options
// --- Payroll Options ----------------------------------------------------------

export const PAYROLL_DAY_CALCULATION_OPTIONS = [
  {
    value: 'working-days',
    label: 'Working Days',
    description: 'Uses work calendar working days.',
  },
  {
    value: 'total-month-days',
    label: 'Total Month Days',
    description: 'Uses every calendar day in the month.',
  },
  {
    value: 'manual-days',
    label: 'Manual Days',
    description: 'Uses fixed HR-entered basis days.',
  },
];

export const PAYROLL_SATURDAY_POLICY_OPTIONS = [
  { value: 'full-day', label: 'Full', description: 'Each working Saturday counts as 1 day.' },
  { value: 'half-day', label: 'Half', description: 'Each working Saturday counts as 0.5 day.' },
  { value: 'off', label: 'Off', description: 'Saturdays do not add working units.' },
];
// Attendance advanced keys
// --- Attendance Advanced Keys -------------------------------------------------

export const ATTENDANCE_ADVANCED_KEYS: AttendanceAdvancedKey[] = [
  'absentThresholdPercentage',
  'graceTime',
  'maxLateAllowedPerMonth',
  'penaltyType',
  'penaltyCountThreshold',
  'earlyExitEnabled',
  'earlyExitGraceTime',
  'overtimeEnabled',
  'overtimeRate',
  'minOvertimeMinutes',
  'holidayWorkBehavior',
  'sandwichRuleEnabled',
  'payrollPreviewEnabled',
];
// Default form factories
// --- Default Form Factories ---------------------------------------------------

export const defaultCalendarForm = (start?: string | null): WorkCalendarForm => ({
  name: '',
  status: 'active',
  effectiveFrom: start ? dayjs(start).format('YYYY-MM-DD') : '',
  effectiveTo: '',
  weeklyOffPattern: 'saturday_sunday',
  customWeeklyOffs: [],
  holidaySyncMode: 'snapshot',
  holidays: [],
});

export const defaultPayrollForm = (calendarId = ''): PayrollForm => ({
  name: '',
  status: 'active',
  workCalendarPolicyId: calendarId,
  isDefault: false,
  dayCalculationType: 'working-days',
  manualMonthDays: {},
  saturdayWorkPolicy: 'full-day',
});

export const defaultAttendanceForm = (calendarId = ''): AttendanceForm => ({
  name: '',
  status: 'active',
  workCalendarPolicyId: calendarId,
  isDefault: false,
  captureMode: 'integrated',
  fullDayThresholdPercentage: '75',
  halfDayThresholdPercentage: '50',
  absentThresholdPercentage: '0',
  missingPunchBehavior: 'requires_review',
  manualCorrectionAllowed: true,
  graceTime: '0',
  maxLateAllowedPerMonth: '0',
  penaltyType: 'none',
  penaltyCountThreshold: '0',
  earlyExitEnabled: false,
  earlyExitGraceTime: '0',
  overtimeEnabled: false,
  overtimeRate: '',
  minOvertimeMinutes: '',
  holidayWorkBehavior: 'comp_off',
  sandwichRuleEnabled: false,
  payrollPreviewEnabled: true,
});

export const defaultAssignmentForm = (start?: string | null): AssignmentForm => ({
  targetType: 'employee',
  targetKey: '',
  targetDisplayName: '',
  payrollPolicyId: '',
  attendancePolicyId: '',
  effectiveFrom: start ? dayjs(start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
  effectiveTo: '',
  priority: '0',
  assignmentReason: '',
  isActive: true,
});

export const defaultAssignmentFilters = (): AssignmentFilters => ({
  search: '',
  targetType: 'all',
  status: 'all',
  payrollPolicyId: '',
  attendancePolicyId: '',
  activeOnDate: '',
  effectiveFrom: '',
  effectiveTo: '',
});
