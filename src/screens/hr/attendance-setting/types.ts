export type AttendancePolicyStatus = 'draft' | 'active';
export type AttendancePayrollIntegrationMode = 'advisory' | 'approved_results';
export type AttendancePolicyEvaluationStatus =
  | 'draft'
  | 'evaluated'
  | 'needs_review'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'cancelled';
export type WeeklyOffPattern = 'sunday' | 'saturday_sunday' | 'custom';
export type MissingPunchBehavior = 'mark_absent' | 'mark_half_day' | 'requires_review';
export type AttendancePenaltyType = 'deduct_half_day' | 'deduct_full_day' | 'none';
export type AttendanceOvertimeRate = '1.5x' | '2.0x' | 'flat';
export type HolidayWorkBehavior = 'paid' | 'comp_off' | 'ot_payout';
export type AttendanceOverrideTargetType = 'department' | 'role' | 'employee_type' | 'shift';

export type AttendanceWorkdayRules = {
  weeklyOffPattern: WeeklyOffPattern;
  customWeeklyOffs: number[];
};

export type AttendancePunchRules = {
  fullDayThresholdPercentage: number;
  halfDayThresholdPercentage: number;
  absentThresholdPercentage: number;
  missingPunchBehavior: MissingPunchBehavior;
};

export type DailyAttendanceRule = {
  hoursBasedPayPercentage: number;
};

export type LateEarlyRule = {
  graceTime: number;
  maxLateAllowedPerMonth: number;
  penaltyType: AttendancePenaltyType;
  penaltyCountThreshold: number;
  earlyExitEnabled: boolean;
  earlyExitGraceTime: number;
};

export type AttendanceOvertimeRules = {
  enabled: boolean;
  rate?: AttendanceOvertimeRate | '';
  minOvertimeMinutes?: number | '';
};

export type AttendanceHolidayRules = {
  workOnHolidayBehavior: HolidayWorkBehavior;
  sandwichRule: boolean;
};

export type AttendanceManualCorrectionRules = {
  allowed: boolean;
};

export type AttendancePolicyOverride = {
  id?: string;
  targetType: AttendanceOverrideTargetType;
  targetId: string;
  targetName: string;
  isActive: boolean;
  priority?: number;
  hoursBasedPayPercentage?: number | '';
  graceTime?: number | '';
  maxLateAllowedPerMonth?: number | '';
  penaltyType?: AttendancePenaltyType | '';
  overtimeEnabled?: boolean;
  overtimeRate?: AttendanceOvertimeRate | '';
  minOvertimeMinutes?: number | '';
};

export type AttendanceConfiguration = {
  policyName: string;
  status: AttendancePolicyStatus;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  lastUpdatedAt?: string | null;
  workdayRules: AttendanceWorkdayRules;
  punchRules: AttendancePunchRules;
  dailyRules: DailyAttendanceRule;
  lateEarlyRules: LateEarlyRule;
  overtime: AttendanceOvertimeRules;
  holidayRules: AttendanceHolidayRules;
  manualCorrectionRules: AttendanceManualCorrectionRules;
  payrollPreviewEnabled: boolean;
  payrollIntegrationMode: AttendancePayrollIntegrationMode;
  requirePublishedAttendanceForPayrollLock: boolean;
  overrides: AttendancePolicyOverride[];
};

export type AttendanceConfigurationPreviewRequest = {
  fromDate: string;
  toDate: string;
  departmentId?: string;
  roleId?: string;
  employeeType?: string;
  shiftId?: string;
  configuration: AttendanceConfiguration;
};

export type AttendanceConfigurationPreviewResponse = {
  affectedEmployeeCount: number;
  estimatedLateCount: number;
  estimatedAbsenceCount: number;
  estimatedOvertimeMinutes: number;
  estimatedPayableDayDelta: number;
  warnings: string[];
};

export type AttendancePolicyEvaluationRequest = {
  academicYearId: string;
  month: number;
  year: number;
  departmentId?: string;
  roleId?: string;
  employeeType?: string;
  shiftId?: string;
};

export type AttendancePolicyEvaluationResult = {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  attendanceDate: string;
  sourceAttendanceId?: string;
  baselineStatus: string;
  baselinePayableUnits: number;
  evaluatedStatus: string;
  evaluatedPayableUnits: number;
  isLate: boolean;
  isEarlyExit: boolean;
  overtimeMinutes: number;
  warnings: string[];
  isManualOverride: boolean;
};

export type AttendancePolicyEvaluationRun = {
  id: string;
  academicYearId: string;
  attendanceConfigurationId: string;
  year: number;
  month: number;
  fromDate: string;
  toDate: string;
  status: AttendancePolicyEvaluationStatus;
  affectedEmployeeCount: number;
  estimatedLateCount: number;
  estimatedAbsenceCount: number;
  estimatedOvertimeMinutes: number;
  estimatedPayableDayDelta: number;
  configHash: string;
  approvedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  lastUpdatedAt?: string | null;
  totalResultCount: number;
  warnings: string[];
  results: AttendancePolicyEvaluationResult[];
};

export type AttendancePolicyEvaluationResultsRequest = {
  runId: string;
  skipCount?: number;
  maxResultCount?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  evaluatedStatus?: string;
  hasWarnings?: boolean;
  isLate?: boolean;
  hasOvertime?: boolean;
  departmentId?: string;
  roleId?: string;
  employeeType?: string;
  shiftId?: string;
};

export type PagedResult<T> = {
  totalCount: number;
  items: T[];
};

export const INITIAL_ATTENDANCE_CONFIG: AttendanceConfiguration = {
  policyName: 'Default Attendance Policy',
  status: 'draft',
  effectiveFrom: null,
  effectiveTo: null,
  workdayRules: {
    weeklyOffPattern: 'saturday_sunday',
    customWeeklyOffs: [],
  },
  punchRules: {
    fullDayThresholdPercentage: 75,
    halfDayThresholdPercentage: 50,
    absentThresholdPercentage: 0,
    missingPunchBehavior: 'requires_review',
  },
  dailyRules: {
    hoursBasedPayPercentage: 75,
  },
  lateEarlyRules: {
    graceTime: 15,
    maxLateAllowedPerMonth: 3,
    penaltyType: 'deduct_half_day',
    penaltyCountThreshold: 3,
    earlyExitEnabled: false,
    earlyExitGraceTime: 0,
  },
  overtime: {
    enabled: false,
    rate: '1.5x',
    minOvertimeMinutes: 30,
  },
  holidayRules: {
    workOnHolidayBehavior: 'comp_off',
    sandwichRule: false,
  },
  manualCorrectionRules: {
    allowed: true,
  },
  payrollPreviewEnabled: true,
  payrollIntegrationMode: 'advisory',
  requirePublishedAttendanceForPayrollLock: false,
  overrides: [],
};
