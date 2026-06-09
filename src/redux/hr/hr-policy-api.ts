import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type PolicyStatus = 'draft' | 'active' | 'archived';
export type EditablePolicyStatus = Exclude<PolicyStatus, 'archived'>;

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
};

export type WorkCalendarPolicy = {
  id: string;
  academicYearId: string;
  name: string;
  status: PolicyStatus;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  weeklyOffPattern: string;
  customWeeklyOffs: number[];
  holidaySyncMode: string;
  holidays?: WorkCalendarHoliday[];
  holidaySummary?: WorkCalendarHolidaySummary;
  version: number;
  creationTime?: string | null;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
};

export type WorkCalendarHoliday = {
  id?: string | null;
  workCalendarPolicyId?: string | null;
  academicYearId: string;
  date: string;
  fromDate?: string | null;
  toDate?: string | null;
  dayCount?: number | null;
  holidayName: string;
  source: 'central_calendar' | 'manual' | string;
  calendarHolidayId?: string | null;
  isIncluded: boolean;
  notes?: string | null;
};

export type WorkCalendarHolidaySummary = {
  totalCount: number;
  includedCount: number;
  removedCount: number;
  manualCount: number;
  centralCount: number;
};

export type PayrollPolicy = {
  id: string;
  academicYearId: string;
  workCalendarPolicyId: string;
  name: string;
  status: PolicyStatus;
  isDefault: boolean;
  dayCalculationType: string;
  manualDays?: number | null;
  manualMonthDays: Array<{ year: number; month: number; manualDays: number }>;
  saturdayWorkPolicy: string;
  holidayOverrides: Array<{
    date: string;
    holidayName: string;
    includedInPayroll: boolean;
    calendarHolidayId?: string | null;
  }>;
  version: number;
  creationTime?: string | null;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
};

export type AttendancePolicy = {
  id: string;
  academicYearId: string;
  workCalendarPolicyId: string;
  name: string;
  status: PolicyStatus;
  isDefault: boolean;
  captureMode: 'manual_status' | 'manual_with_time' | 'integrated';
  fullDayThresholdPercentage: number;
  halfDayThresholdPercentage: number;
  absentThresholdPercentage: number;
  missingPunchBehavior: string;
  manualCorrectionAllowed: boolean;
  graceTime: number;
  maxLateAllowedPerMonth: number;
  penaltyType: string;
  penaltyCountThreshold: number;
  earlyExitEnabled: boolean;
  earlyExitGraceTime: number;
  overtimeEnabled: boolean;
  overtimeRate?: string | null;
  minOvertimeMinutes?: number | null;
  holidayWorkBehavior: string;
  sandwichRuleEnabled: boolean;
  payrollPreviewEnabled: boolean;
  version: number;
  creationTime?: string | null;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
};

export type HrPolicyAssignment = {
  id: string;
  academicYearId: string;
  targetType: 'employee' | 'group';
  targetKey: string;
  targetDisplayName?: string | null;
  targetOrganizationNames?: string[] | null;
  attendancePolicyId: string;
  payrollPolicyId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  priority: number;
  assignmentReason?: string | null;
  creationTime?: string | null;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
};

export type CreateUpdateWorkCalendarPolicy = Omit<
  Partial<WorkCalendarPolicy>,
  'id' | 'version' | 'createdAt' | 'lastUpdatedAt' | 'status'
> & {
  status?: EditablePolicyStatus;
};

export type CreateUpdatePayrollPolicy = Omit<
  Partial<PayrollPolicy>,
  'id' | 'version' | 'createdAt' | 'lastUpdatedAt' | 'status'
> & {
  status?: EditablePolicyStatus;
};

export type CreateUpdateAttendancePolicy = Omit<
  Partial<AttendancePolicy>,
  'id' | 'version' | 'createdAt' | 'lastUpdatedAt' | 'status'
> & {
  status?: EditablePolicyStatus;
};

export type CreateUpdateHrPolicyAssignment = Omit<
  Partial<HrPolicyAssignment>,
  'id' | 'createdAt' | 'lastUpdatedAt'
>;

export type EmployeePolicyOverrideRequest = {
  employeeId: string;
  academicYearId: string;
  assignmentId?: string | null;
  payrollPolicyId: string;
  attendancePolicyId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  assignmentReason?: string | null;
  confirmationToken?: string | null;
};

export type DisableEmployeePolicyOverrideRequest = {
  employeeId: string;
  academicYearId: string;
  assignmentId?: string | null;
  effectiveDate: string;
  assignmentReason?: string | null;
  confirmationToken?: string | null;
};

export type EffectiveEmployeePolicies = {
  employeeId: string;
  academicYearId?: string;
  date: string;
  assignment?: HrPolicyAssignment | null;
  policySource: string;
  matchedAssignmentId?: string | null;
  matchedTargetType?: string | null;
  matchedTargetKey?: string | null;
  matchedTargetDisplayName?: string | null;
  matchedPriority?: number | null;
  attendancePolicy: AttendancePolicy;
  payrollPolicy: PayrollPolicy;
  attendanceWorkCalendarPolicy?: WorkCalendarPolicy | null;
  payrollWorkCalendarPolicy?: WorkCalendarPolicy | null;
  resolutionSteps?: EffectivePolicyResolutionStep[];
  resolutionSummary?: string | null;
  riskSummary?: string | null;
  recommendedAction?: string | null;
};

export type EffectivePolicyResolutionStep = {
  source: string;
  targetType: string;
  targetKey?: string | null;
  targetDisplayName?: string | null;
  assignmentId?: string | null;
  priority?: number | null;
  status: 'matched' | 'skipped' | string;
  skipReason: string;
  payrollPolicyId?: string | null;
  attendancePolicyId?: string | null;
};

export type PolicyHolidayImpactPreview = {
  academicYearId: string;
  workCalendarPolicyId?: string | null;
  payrollPolicyId?: string | null;
  attendancePolicyId?: string | null;
  items: Array<{
    date: string;
    fromDate?: string | null;
    toDate?: string | null;
    dayCount?: number | null;
    calendarHolidayId: string;
    holidayName: string;
    workCalendarPolicyId?: string | null;
    workCalendarPolicyName?: string | null;
    calendarSource: string;
    attendanceImpact: string;
    isAttendanceWorkingDay: boolean;
    isPunchRequired: boolean;
    holidayWorkBehavior: string;
    payrollImpact: string;
    isPaidInPayroll: boolean;
    payableUnit: number;
    payrollBasisDayDelta?: number;
    payrollOverrideSource: string;
    attendanceBehaviorText?: string;
    payrollBasisImpactText?: string;
    hasDifference: boolean;
  }>;
};

export type HrPolicyImpactSeverity = 'info' | 'warning' | 'blocking';

export type HrPolicyImpactPreview = {
  policyType: string;
  policyId?: string | null;
  academicYearId: string;
  action: string;
  currentVersion?: number | null;
  proposedVersion?: number | null;
  affectedEmployeeCount: number;
  affectedAssignmentCount: number;
  affectedEmployees: Array<{
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    department?: string | null;
    roleId?: string | null;
    shiftId?: string | null;
    employeeType?: string | null;
  }>;
  affectedPayrollMonths: Array<{
    year: number;
    month: number;
    label: string;
    count: number;
    status: string;
  }>;
  lockedPayrollMonths: Array<{
    year: number;
    month: number;
    label: string;
    count: number;
    status: string;
  }>;
  affectedAttendanceEvaluationMonths: Array<{
    year: number;
    month: number;
    label: string;
    count: number;
    status: string;
  }>;
  hasStalePayrollRisk: boolean;
  warnings: Array<{ severity: HrPolicyImpactSeverity; code: string; message: string }>;
  effectiveAssignmentConflicts?: HrPolicyEffectiveAssignmentConflict[];
  requiresConfirmation?: boolean;
  confirmationToken?: string | null;
  expiresAt?: string | null;
  blockingWarnings?: Array<{ severity: HrPolicyImpactSeverity; code: string; message: string }>;
  resolutionSummary?: string | null;
  riskSummary?: string | null;
  recommendedAction?: string | null;
};

export type HrPolicyEffectiveAssignmentConflict = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  winningAssignment?: HrPolicyEffectiveAssignmentCandidate | null;
  candidateAssignments: HrPolicyEffectiveAssignmentCandidate[];
};

export type HrPolicyEffectiveAssignmentCandidate = {
  assignmentId?: string | null;
  targetType: string;
  targetKey: string;
  targetDisplayName?: string | null;
  payrollPolicyId: string;
  payrollPolicyName: string;
  attendancePolicyId: string;
  attendancePolicyName: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  status: string;
  skipReason: string;
};

export type HrPolicyAssignmentConflict = {
  assignmentId: string;
  targetType: string;
  targetKey: string;
  targetDisplayName?: string | null;
  payrollPolicyId: string;
  payrollPolicyName: string;
  attendancePolicyId: string;
  attendancePolicyName: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  suggestedFixes: string[];
};

export type HrPolicyAuditSummary = {
  policyType: string;
  policyId: string;
  name: string;
  version: number;
  creationTime: string;
  creatorId?: string | null;
  createdByName?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  lastModifiedByName?: string | null;
  lastDefaultSetSummary?: string | null;
  latestAssignmentReason?: string | null;
  events?: Array<{
    timestamp: string;
    actorId?: string | null;
    actorName?: string | null;
    action: string;
    sourceMethod?: string | null;
    changedFieldsSummary?: string | null;
  }>;
};

export type HrAuditChangedField = {
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
};

export type HrAuditEvent = {
  id: string;
  academicYearId?: string | null;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  actorUserId?: string | null;
  actorNameSnapshot?: string | null;
  occurredAt: string;
  occurredAtUtc?: string;
  occurredAtDisplay?: string;
  actorDisplayName?: string;
  actionLabel?: string;
  reason?: string | null;
  summary: string;
  changedFields: HrAuditChangedField[];
  changedFieldCount?: number;
  contextJson?: string | null;
  correlationId?: string | null;
  sourceAuditLogId?: string | null;
};

export type HrAuditEventListArgs = {
  academicYearId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  actorUserId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
};

export type HrPolicyType = 'work_calendar' | 'payroll' | 'attendance';

export type HrPolicyVersion = {
  id: string;
  policyType: HrPolicyType;
  policyId: string;
  academicYearId: string;
  versionNumber: number;
  name: string;
  status: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  changeAction: string;
  changeReason?: string | null;
  creationTime: string;
  creatorId?: string | null;
  createdByName?: string | null;
  summary?: string | null;
  changedFieldCount?: number;
  snapshotJson: string;
};

export type HrPolicyVersionCompare = {
  policyType: HrPolicyType;
  policyId: string;
  fromVersion: HrPolicyVersion;
  toVersion: HrPolicyVersion;
  differences: Array<{
    field: string;
    fromValue?: string | null;
    toValue?: string | null;
    fieldKey?: string;
    fieldLabel?: string;
    category?: string;
    fromDisplayValue?: string | null;
    toDisplayValue?: string | null;
    fromRawValue?: string | null;
    toRawValue?: string | null;
  }>;
};

type PolicyListArgs = {
  academicYearId?: string;
  maxResultCount?: number;
  skipCount?: number;
  search?: string;
  targetType?: string;
};

export const policyInvalidationTags = [
  employeeType.attendanceRule,
  employeeType.runPayroll,
  employeeType.salarySlip,
];
const policyTags = policyInvalidationTags;

const policyVersionPath = (policyType: HrPolicyType, policyId: string) =>
  `/hr/${policyType}/policies/${policyId}/versions`;

export type PolicyHolidayImpactPreviewArgs = {
  academicYearId?: string;
  workCalendarPolicyId?: string;
  payrollPolicyId?: string;
  attendancePolicyId?: string;
  fromDate?: string;
  toDate?: string;
  month?: string;
};

export const buildPolicyHolidayImpactPreviewParams = ({
  academicYearId,
  workCalendarPolicyId,
  payrollPolicyId,
  attendancePolicyId,
  fromDate,
  toDate,
  month,
}: PolicyHolidayImpactPreviewArgs) => ({
  academicYearId,
  workCalendarPolicyId,
  payrollPolicyId,
  attendancePolicyId,
  fromDate: month ? undefined : fromDate,
  toDate: month ? undefined : toDate,
  month,
});

export type PolicyAssignmentPreviewArgs = {
  academicYearId?: string;
  date?: string;
  employeeId?: string;
  groupId?: string;
};

export const buildPolicyAssignmentPreviewParams = ({
  academicYearId,
  date,
  employeeId,
  groupId,
}: PolicyAssignmentPreviewArgs) => ({
  academicYearId,
  date,
  employeeId: employeeId || undefined,
  groupId: groupId || undefined,
});

export const hrPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkCalendarPolicies: builder.query<PagedResult<WorkCalendarPolicy>, PolicyListArgs>({
      query: ({ academicYearId, maxResultCount = 50, skipCount = 0, search }) => ({
        url: '/hr/work-calendar-policies',
        method: 'GET',
        params: { academicYearId, maxResultCount, skipCount, search },
      }),
      providesTags: policyTags,
    }),
    createWorkCalendarPolicy: builder.mutation<WorkCalendarPolicy, CreateUpdateWorkCalendarPolicy>({
      query: (body) => ({
        url: '/hr/work-calendar-policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    getWorkCalendarHolidayImportPreview: builder.query<
      WorkCalendarHoliday[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/hr/work-calendar-policies/holiday-import-preview',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: policyTags,
    }),
    getWorkCalendarPolicyHolidays: builder.query<WorkCalendarHoliday[], { id: string }>({
      query: ({ id }) => ({
        url: `/hr/work-calendar-policies/${id}/holidays`,
        method: 'GET',
      }),
      providesTags: policyTags,
    }),
    cloneWorkCalendarPolicy: builder.mutation<
      WorkCalendarPolicy,
      { id: string; name?: string; effectiveFrom?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/hr/work-calendar-policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    deleteWorkCalendarPolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/work-calendar-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: policyTags,
    }),
    deleteWorkCalendarPolicyWithToken: builder.mutation<void, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/hr/work-calendar-policies/${id}`,
        method: 'DELETE',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    unarchiveWorkCalendarPolicy: builder.mutation<WorkCalendarPolicy, string>({
      query: (id) => ({
        url: `/hr/work-calendar-policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: policyTags,
    }),
    updateWorkCalendarPolicy: builder.mutation<
      WorkCalendarPolicy,
      { id: string; body: CreateUpdateWorkCalendarPolicy }
    >({
      query: ({ id, body }) => ({
        url: `/hr/work-calendar-policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updateWorkCalendarPolicyWithToken: builder.mutation<
      WorkCalendarPolicy,
      { id: string; body: CreateUpdateWorkCalendarPolicy; token?: string }
    >({
      query: ({ id, body, token }) => ({
        url: `/hr/work-calendar-policies/${id}`,
        method: 'PUT',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    getPayrollPolicies: builder.query<PagedResult<PayrollPolicy>, PolicyListArgs>({
      query: ({ academicYearId, maxResultCount = 50, skipCount = 0, search }) => ({
        url: '/hr/payroll/policies',
        method: 'GET',
        params: { academicYearId, maxResultCount, skipCount, search },
      }),
      providesTags: policyTags,
    }),
    createPayrollPolicy: builder.mutation<PayrollPolicy, CreateUpdatePayrollPolicy>({
      query: (body) => ({
        url: '/hr/payroll/policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    createPayrollPolicyWithToken: builder.mutation<
      PayrollPolicy,
      { body: CreateUpdatePayrollPolicy; token?: string }
    >({
      query: ({ body, token }) => ({
        url: '/hr/payroll/policies',
        method: 'POST',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    clonePayrollPolicy: builder.mutation<
      PayrollPolicy,
      { id: string; name?: string; effectiveFrom?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/hr/payroll/policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    deletePayrollPolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/payroll/policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: policyTags,
    }),
    deletePayrollPolicyWithToken: builder.mutation<void, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/hr/payroll/policies/${id}`,
        method: 'DELETE',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    unarchivePayrollPolicy: builder.mutation<PayrollPolicy, string>({
      query: (id) => ({
        url: `/hr/payroll/policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: policyTags,
    }),
    updatePayrollPolicy: builder.mutation<
      PayrollPolicy,
      { id: string; body: CreateUpdatePayrollPolicy }
    >({
      query: ({ id, body }) => ({
        url: `/hr/payroll/policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updatePayrollPolicyWithToken: builder.mutation<
      PayrollPolicy,
      { id: string; body: CreateUpdatePayrollPolicy; token?: string }
    >({
      query: ({ id, body, token }) => ({
        url: `/hr/payroll/policies/${id}`,
        method: 'PUT',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    setDefaultPayrollPolicy: builder.mutation<PayrollPolicy, string>({
      query: (id) => ({
        url: `/hr/payroll/policies/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: policyTags,
    }),
    setDefaultPayrollPolicyWithToken: builder.mutation<
      PayrollPolicy,
      { id: string; token?: string }
    >({
      query: ({ id, token }) => ({
        url: `/hr/payroll/policies/${id}/set-default`,
        method: 'POST',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    getAttendancePolicies: builder.query<PagedResult<AttendancePolicy>, PolicyListArgs>({
      query: ({ academicYearId, maxResultCount = 50, skipCount = 0, search }) => ({
        url: '/hr/attendance/policies',
        method: 'GET',
        params: { academicYearId, maxResultCount, skipCount, search },
      }),
      providesTags: policyTags,
    }),
    createAttendancePolicy: builder.mutation<AttendancePolicy, CreateUpdateAttendancePolicy>({
      query: (body) => ({
        url: '/hr/attendance/policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    createAttendancePolicyWithToken: builder.mutation<
      AttendancePolicy,
      { body: CreateUpdateAttendancePolicy; token?: string }
    >({
      query: ({ body, token }) => ({
        url: '/hr/attendance/policies',
        method: 'POST',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    cloneAttendancePolicy: builder.mutation<
      AttendancePolicy,
      { id: string; name?: string; effectiveFrom?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/hr/attendance/policies/${id}/clone`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    deleteAttendancePolicy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/attendance/policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: policyTags,
    }),
    deleteAttendancePolicyWithToken: builder.mutation<void, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/hr/attendance/policies/${id}`,
        method: 'DELETE',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    unarchiveAttendancePolicy: builder.mutation<AttendancePolicy, string>({
      query: (id) => ({
        url: `/hr/attendance/policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: policyTags,
    }),
    updateAttendancePolicy: builder.mutation<
      AttendancePolicy,
      { id: string; body: CreateUpdateAttendancePolicy }
    >({
      query: ({ id, body }) => ({
        url: `/hr/attendance/policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updateAttendancePolicyWithToken: builder.mutation<
      AttendancePolicy,
      { id: string; body: CreateUpdateAttendancePolicy; token?: string }
    >({
      query: ({ id, body, token }) => ({
        url: `/hr/attendance/policies/${id}`,
        method: 'PUT',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    setDefaultAttendancePolicy: builder.mutation<AttendancePolicy, string>({
      query: (id) => ({
        url: `/hr/attendance/policies/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: policyTags,
    }),
    setDefaultAttendancePolicyWithToken: builder.mutation<
      AttendancePolicy,
      { id: string; token?: string }
    >({
      query: ({ id, token }) => ({
        url: `/hr/attendance/policies/${id}/set-default`,
        method: 'POST',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    getHrPolicyAssignments: builder.query<PagedResult<HrPolicyAssignment>, PolicyListArgs>({
      query: ({ academicYearId, maxResultCount = 50, skipCount = 0, search, targetType }) => ({
        url: '/hr/policy-assignments',
        method: 'GET',
        params: { academicYearId, maxResultCount, skipCount, search, targetType },
      }),
      providesTags: policyTags,
    }),
    createHrPolicyAssignment: builder.mutation<HrPolicyAssignment, CreateUpdateHrPolicyAssignment>({
      query: (body) => ({
        url: '/hr/policy-assignments',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    createHrPolicyAssignmentWithToken: builder.mutation<
      HrPolicyAssignment,
      { body: CreateUpdateHrPolicyAssignment; token?: string }
    >({
      query: ({ body, token }) => ({
        url: '/hr/policy-assignments',
        method: 'POST',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    deleteHrPolicyAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/policy-assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: policyTags,
    }),
    deleteHrPolicyAssignmentWithToken: builder.mutation<void, { id: string; token?: string }>({
      query: ({ id, token }) => ({
        url: `/hr/policy-assignments/${id}`,
        method: 'DELETE',
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    upsertEmployeePolicyOverride: builder.mutation<
      HrPolicyAssignment,
      EmployeePolicyOverrideRequest
    >({
      query: (body) => ({
        url: '/hr/policy-assignments/direct-employee-override',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    disableEmployeePolicyOverride: builder.mutation<void, DisableEmployeePolicyOverrideRequest>({
      query: (body) => ({
        url: '/hr/policy-assignments/direct-employee-override/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updateHrPolicyAssignment: builder.mutation<
      HrPolicyAssignment,
      { id: string; body: CreateUpdateHrPolicyAssignment }
    >({
      query: ({ id, body }) => ({
        url: `/hr/policy-assignments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    updateHrPolicyAssignmentWithToken: builder.mutation<
      HrPolicyAssignment,
      { id: string; body: CreateUpdateHrPolicyAssignment; token?: string }
    >({
      query: ({ id, body, token }) => ({
        url: `/hr/policy-assignments/${id}`,
        method: 'PUT',
        body,
        headers: token ? { 'X-HR-Policy-Impact-Token': token } : undefined,
      }),
      invalidatesTags: policyTags,
    }),
    previewPolicyAssignmentImpact: builder.mutation<
      HrPolicyImpactPreview,
      { action: string; assignmentId?: string; assignment: CreateUpdateHrPolicyAssignment }
    >({
      query: (body) => ({
        url: '/hr/policy-assignments/impact-preview',
        method: 'POST',
        body,
      }),
    }),
    previewPolicyImpact: builder.mutation<
      HrPolicyImpactPreview,
      {
        policyType: 'work_calendar' | 'payroll' | 'attendance';
        policyId?: string;
        academicYearId?: string;
        action: string;
        proposedPolicyId?: string;
        workCalendarPolicy?: CreateUpdateWorkCalendarPolicy;
        payrollPolicy?: CreateUpdatePayrollPolicy;
        attendancePolicy?: CreateUpdateAttendancePolicy;
      }
    >({
      query: (body) => ({
        url: '/hr/policies/impact-preview',
        method: 'POST',
        body,
      }),
    }),
    getPolicyAuditSummary: builder.query<
      HrPolicyAuditSummary,
      { policyType: HrPolicyType; id: string }
    >({
      query: ({ policyType, id }) => ({
        url: `/hr/policies/${policyType}/${id}/audit-summary`,
        method: 'GET',
      }),
      providesTags: policyTags,
    }),
    getHrAuditEvents: builder.query<PagedResult<HrAuditEvent>, HrAuditEventListArgs>({
      query: (params) => ({
        url: '/hr/audit-events',
        method: 'GET',
        params,
      }),
      providesTags: policyTags,
    }),
    getHrEntityAuditEvents: builder.query<
      PagedResult<HrAuditEvent>,
      { entityType: string; entityId: string; maxResultCount?: number; skipCount?: number }
    >({
      query: ({ entityType, entityId, maxResultCount = 50, skipCount = 0 }) => ({
        url: `/hr/${entityType}/${entityId}/audit-events`,
        method: 'GET',
        params: { maxResultCount, skipCount },
      }),
      providesTags: policyTags,
    }),
    getPolicyVersions: builder.query<
      PagedResult<HrPolicyVersion>,
      { policyType: HrPolicyType; policyId: string; maxResultCount?: number; skipCount?: number }
    >({
      query: ({ policyType, policyId, maxResultCount = 20, skipCount = 0 }) => ({
        url: policyVersionPath(policyType, policyId),
        method: 'GET',
        params: { maxResultCount, skipCount },
      }),
      providesTags: policyTags,
    }),
    comparePolicyVersions: builder.query<
      HrPolicyVersionCompare,
      { policyType: HrPolicyType; policyId: string; fromVersionId: string; toVersionId: string }
    >({
      query: ({ policyType, policyId, fromVersionId, toVersionId }) => ({
        url: `${policyVersionPath(policyType, policyId)}/compare`,
        method: 'GET',
        params: { fromVersionId, toVersionId },
      }),
      providesTags: policyTags,
    }),
    getPolicyRestorePreview: builder.query<
      HrPolicyImpactPreview,
      { policyType: HrPolicyType; policyId: string; versionId: string }
    >({
      query: ({ policyType, policyId, versionId }) => ({
        url: `${policyVersionPath(policyType, policyId)}/${versionId}/restore-preview`,
        method: 'GET',
      }),
      providesTags: policyTags,
    }),
    restorePolicyVersionDraft: builder.mutation<
      WorkCalendarPolicy | PayrollPolicy | AttendancePolicy,
      {
        policyType: HrPolicyType;
        policyId: string;
        versionId: string;
        name?: string;
        effectiveFrom?: string;
        changeReason?: string;
      }
    >({
      query: ({ policyType, policyId, versionId, ...body }) => ({
        url: `${policyVersionPath(policyType, policyId)}/${versionId}/restore-draft`,
        method: 'POST',
        body,
      }),
      invalidatesTags: policyTags,
    }),
    getPolicyAssignmentPreview: builder.query<
      EffectiveEmployeePolicies,
      PolicyAssignmentPreviewArgs
    >({
      query: (params) => ({
        url: '/hr/policy-assignment-preview',
        method: 'GET',
        params: buildPolicyAssignmentPreviewParams(params),
      }),
      providesTags: policyTags,
    }),
    getPolicyHolidayImpactPreview: builder.query<
      PolicyHolidayImpactPreview,
      PolicyHolidayImpactPreviewArgs
    >({
      query: (params) => ({
        url: '/hr/policy-holiday-impact-preview',
        method: 'GET',
        params: buildPolicyHolidayImpactPreviewParams(params),
      }),
      providesTags: policyTags,
    }),
  }),
});

export const {
  useGetWorkCalendarPoliciesQuery,
  useCreateWorkCalendarPolicyMutation,
  useGetWorkCalendarHolidayImportPreviewQuery,
  useLazyGetWorkCalendarHolidayImportPreviewQuery,
  useGetWorkCalendarPolicyHolidaysQuery,
  useLazyGetWorkCalendarPolicyHolidaysQuery,
  useCloneWorkCalendarPolicyMutation,
  useUpdateWorkCalendarPolicyMutation,
  useUpdateWorkCalendarPolicyWithTokenMutation,
  useDeleteWorkCalendarPolicyMutation,
  useDeleteWorkCalendarPolicyWithTokenMutation,
  useUnarchiveWorkCalendarPolicyMutation,
  useGetPayrollPoliciesQuery,
  useCreatePayrollPolicyMutation,
  useCreatePayrollPolicyWithTokenMutation,
  useClonePayrollPolicyMutation,
  useUpdatePayrollPolicyMutation,
  useUpdatePayrollPolicyWithTokenMutation,
  useDeletePayrollPolicyMutation,
  useDeletePayrollPolicyWithTokenMutation,
  useUnarchivePayrollPolicyMutation,
  useSetDefaultPayrollPolicyMutation,
  useSetDefaultPayrollPolicyWithTokenMutation,
  useGetAttendancePoliciesQuery,
  useCreateAttendancePolicyMutation,
  useCreateAttendancePolicyWithTokenMutation,
  useCloneAttendancePolicyMutation,
  useUpdateAttendancePolicyMutation,
  useUpdateAttendancePolicyWithTokenMutation,
  useDeleteAttendancePolicyMutation,
  useDeleteAttendancePolicyWithTokenMutation,
  useUnarchiveAttendancePolicyMutation,
  useSetDefaultAttendancePolicyMutation,
  useSetDefaultAttendancePolicyWithTokenMutation,
  useGetHrPolicyAssignmentsQuery,
  useCreateHrPolicyAssignmentMutation,
  useCreateHrPolicyAssignmentWithTokenMutation,
  useUpsertEmployeePolicyOverrideMutation,
  useDisableEmployeePolicyOverrideMutation,
  useUpdateHrPolicyAssignmentMutation,
  useUpdateHrPolicyAssignmentWithTokenMutation,
  usePreviewPolicyAssignmentImpactMutation,
  usePreviewPolicyImpactMutation,
  useGetPolicyAuditSummaryQuery,
  useGetHrAuditEventsQuery,
  useGetHrEntityAuditEventsQuery,
  useGetPolicyVersionsQuery,
  useComparePolicyVersionsQuery,
  useGetPolicyRestorePreviewQuery,
  useRestorePolicyVersionDraftMutation,
  useDeleteHrPolicyAssignmentMutation,
  useDeleteHrPolicyAssignmentWithTokenMutation,
  useGetPolicyAssignmentPreviewQuery,
  useGetPolicyHolidayImpactPreviewQuery,
} = hrPolicyApi;
