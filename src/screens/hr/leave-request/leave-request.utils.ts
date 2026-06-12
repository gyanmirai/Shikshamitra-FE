import type { AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const LEAVE_TARGET_EMPLOYEE_REQUIRED = 'HR:Leave:020033';
export const LEAVE_EMPLOYEE_NOT_FOUND = 'HR:Leave:020006';
export const LEAVE_POLICY_NOT_FOUND = 'HR:Leave:020015';
export const LEAVE_MAX_DAYS_EXCEEDED = 'HR:Leave:020016';
export const LEAVE_INSUFFICIENT_BALANCE = 'HR:Leave:020017';
export const LEAVE_NOTICE_PERIOD = 'HR:Leave:020018';
export const LEAVE_PAST_DATE = 'HR:Leave:020013';
export const LEAVE_POLICY_INACTIVE = 'HR:Leave:020019';
export const LEAVE_DATES_OUTSIDE_ACADEMIC_YEAR = 'HR:Leave:020028';
export const LEAVE_NO_BUSINESS_DAYS_IN_RANGE = 'HR:Leave:020032';
export const MIN_LEAVE_NOTICE_DAYS = 2;
export const SELF_EMPLOYEE_ID = 'self';
export const SELF_OPTION = { id: SELF_EMPLOYEE_ID, label: 'Self' } as const;
export const APPLY_LEAVE_ROW_ACTION_LABELS = ['View', 'Cancel'] as const;

export type LeaveCenterContext = 'hr' | 'self';
export type LeaveCenterTab = 'my-requests' | 'approvals' | 'balance';
export type LeaveAttachmentMode = 'hr' | 'self';
export type LeaveRequestMode = 'hr' | 'self';
export type EmployeeOption = {
  id: string;
  label: string;
  status?: EmployeeStatusType | number | string | null;
  employeeStatusType?: EmployeeStatusType | number | string | null;
};

export type LeavePolicyOption = {
  id?: string;
  leaveType?: string | { id?: string | null } | null;
  leaveTypeMasterId?: string | null;
  rules?: Array<{
    id?: string | null;
    leaveType?: { id?: string | null; name?: string | null; color?: string | null } | null;
    leaveTypeId?: string | null;
    isActive?: boolean | null;
    leaveCount?: number | null;
    minNoticeDays?: number | null;
    maxDaysPerRequest?: number | null;
    attachmentRequiredAfterDays?: number | null;
    allowHalfDay?: boolean | null;
    allowNegativeBalance?: boolean | null;
  }> | null;
};

export type LeaveTypeOption = {
  id?: string | null;
  name?: string | null;
  color?: string | null;
};

export type EffectiveLeavePolicyPreview = {
  id?: string | null;
  allowedLeaveTypeIds?: Array<string | null | undefined> | null;
} | null;

export type LeavePolicyResolution =
  | { status: 'resolved'; policyId: string }
  | { status: 'missing'; policyId: ''; message: string }
  | { status: 'ambiguous'; policyId: ''; message: string };

export interface LeaveRequestFormValuesForPayload {
  employee: EmployeeOption | null;
  leaveTypeMasterId: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  halfDay: boolean;
  reason: string;
  docs: unknown;
}

export function parseApiDateWithoutTimezoneShift(input: string): dayjs.Dayjs {
  const dateOnly = String(input || '').slice(0, 10);
  return dayjs(dateOnly || input);
}

export function formatLeaveCalendarDateForPayload(date: dayjs.Dayjs | null): string {
  return date?.isValid() ? date.format('YYYY-MM-DD') : '';
}

export function formatLeaveCalendarDateForDisplay(
  input: string | null | undefined,
  outputFormat = 'DD-MM-YYYY'
): string {
  if (!input) {
    return '-';
  }

  const parsed = parseApiDateWithoutTimezoneShift(String(input));
  return parsed.isValid() ? parsed.format(outputFormat) : '-';
}

export function getMinimumLeaveStartDate(today: dayjs.ConfigType = dayjs()): dayjs.Dayjs {
  return dayjs(today).startOf('day').add(MIN_LEAVE_NOTICE_DAYS, 'day');
}

export function isLeaveNoticePeriodSatisfied(
  startDate: dayjs.Dayjs | null,
  today: dayjs.ConfigType = dayjs()
): boolean {
  if (!startDate?.isValid()) {
    return true;
  }

  return !startDate.startOf('day').isBefore(getMinimumLeaveStartDate(today), 'day');
}

export function getLeaveNoticePeriodMessage(today: dayjs.ConfigType = dayjs()): string {
  return `Leave must be requested at least ${MIN_LEAVE_NOTICE_DAYS} days in advance. Earliest available date is ${getMinimumLeaveStartDate(today).format('DD/MM/YYYY')}.`;
}

export function shouldEnforceLeaveNoticePeriod(
  mode: LeaveRequestMode,
  isAdminUser: boolean,
  employee: EmployeeOption | null
): boolean {
  if (mode === 'self' || isAdminUser) {
    return mode === 'self';
  }

  return !employee?.id || employee.id === SELF_EMPLOYEE_ID;
}

export function resolveLeaveTypeMasterIdFromPolicy(
  policy: LeavePolicyOption | null | undefined
): string {
  if (!policy) {
    return '';
  }

  if (typeof policy.leaveType === 'string') {
    return policy.leaveType;
  }

  return policy.leaveType?.id || policy.leaveTypeMasterId || '';
}

export function resolveLeavePolicyIdForLeaveType(
  policies: LeavePolicyOption[] | null | undefined,
  leaveTypeMasterId: string | null | undefined
): LeavePolicyResolution {
  if (!leaveTypeMasterId) {
    return {
      status: 'missing',
      policyId: '',
      message: 'Please select a leave type.',
    };
  }

  const matchingPolicies = (policies || []).filter(
    (policy) => resolveLeaveTypeMasterIdFromPolicy(policy) === leaveTypeMasterId
  );

  if (matchingPolicies.length === 1 && matchingPolicies[0]?.id) {
    return { status: 'resolved', policyId: matchingPolicies[0].id };
  }

  if (matchingPolicies.length > 1) {
    return {
      status: 'ambiguous',
      policyId: '',
      message:
        'Multiple active leave policies are configured for this leave type. Please fix Policies & Rules before creating this request.',
    };
  }

  return {
    status: 'missing',
    policyId: '',
    message:
      'No active leave policy is configured for this leave type. Please configure it in Policies & Rules.',
  };
}

export function getActiveLeavePolicyRules(policy: LeavePolicyOption | null | undefined) {
  return (policy?.rules || []).filter((rule) => rule?.isActive !== false);
}

export function getSelectableLeaveRequestOptions<
  TLeaveType extends LeaveTypeOption,
  TLeavePolicy extends LeavePolicyOption,
>(
  leaveTypes: TLeaveType[] | null | undefined,
  leavePolicies: TLeavePolicy[] | null | undefined
): { leaveTypes: TLeaveType[]; leavePolicies: TLeavePolicy[] } {
  const catalogById = new Map(
    (leaveTypes || [])
      .filter((leaveType) => Boolean(leaveType?.id))
      .map((leaveType) => [leaveType.id as string, leaveType])
  );
  const selectableById = new Map<string, TLeaveType>();
  const policiesWithRules = (leavePolicies || []).filter((policy) =>
    getActiveLeavePolicyRules(policy).some((rule) => {
      const leaveTypeId = rule.leaveType?.id || rule.leaveTypeId || '';
      return Boolean(leaveTypeId && catalogById.has(leaveTypeId));
    })
  );

  policiesWithRules.forEach((policy) => {
    getActiveLeavePolicyRules(policy).forEach((rule) => {
      const leaveTypeId = rule.leaveType?.id || rule.leaveTypeId || '';
      if (!leaveTypeId || !catalogById.has(leaveTypeId) || selectableById.has(leaveTypeId)) {
        return;
      }
      selectableById.set(leaveTypeId, catalogById.get(leaveTypeId)!);
    });
  });

  return {
    leaveTypes: Array.from(selectableById.values()),
    leavePolicies: policiesWithRules,
  };
}

export function resolveLeavePolicyPreviewEmployeeId(
  employee: EmployeeOption | null | undefined,
  authEmployeeId: string | null | undefined,
  mode: LeaveRequestMode
): string | undefined {
  if (mode === 'self' || employee?.id === SELF_EMPLOYEE_ID) {
    return authEmployeeId || undefined;
  }

  return employee?.id || undefined;
}

export function isLeavePolicyPreviewEmployeeResolutionBlocked(
  employee: EmployeeOption | null | undefined,
  authEmployeeId: string | null | undefined,
  mode: LeaveRequestMode
): boolean {
  return (mode === 'self' || employee?.id === SELF_EMPLOYEE_ID) && !authEmployeeId;
}

export function getVisibleLeaveTypeOptionsForEffectivePolicy<TLeaveType extends LeaveTypeOption>(
  leaveTypes: TLeaveType[] | null | undefined,
  leavePolicy: EffectiveLeavePolicyPreview,
  hasResolvedEmployee: boolean,
  isPreviewLoading = false,
  hasPreviewError = false
): TLeaveType[] {
  const catalog = leaveTypes || [];
  if (!hasResolvedEmployee) {
    return catalog;
  }

  if (isPreviewLoading || hasPreviewError || !leavePolicy?.id) {
    return [];
  }

  const allowedLeaveTypeIds = new Set((leavePolicy.allowedLeaveTypeIds || []).filter(Boolean));
  if (allowedLeaveTypeIds.size === 0) {
    return [];
  }

  return catalog.filter((item) => Boolean(item?.id && allowedLeaveTypeIds.has(item.id)));
}

export function isSelectedLeaveTypeVisible<TLeaveType extends LeaveTypeOption>(
  leaveTypeMasterId: string | null | undefined,
  visibleLeaveTypes: TLeaveType[] | null | undefined
): boolean {
  if (!leaveTypeMasterId) {
    return true;
  }

  return (visibleLeaveTypes || []).some((item) => item?.id === leaveTypeMasterId);
}

export function buildCreateLeaveRequestFormData(
  values: LeaveRequestFormValuesForPayload
): FormData {
  const formData = new FormData();

  if (values.employee && values.employee.id !== SELF_EMPLOYEE_ID) {
    formData.append('forEmployeeId', values.employee.id);
  }

  formData.append('leaveTypeId', values.leaveTypeMasterId);
  formData.append('startDate', formatLeaveCalendarDateForPayload(values.startDate));
  formData.append('endDate', formatLeaveCalendarDateForPayload(values.endDate));
  formData.append('halfDay', String(values.halfDay));
  formData.append('reason', values.reason);

  const docs = values.docs as any;
  if (docs instanceof File) {
    formData.append('File', docs);
  } else if (Array.isArray(docs) && docs.length > 0 && docs[0] instanceof File) {
    formData.append('File', docs[0]);
  }

  return formData;
}

export function countLeaveUnits(
  startDate: dayjs.Dayjs | null,
  endDate: dayjs.Dayjs | null,
  halfDay: boolean
): number {
  if (!startDate?.isValid() || !endDate?.isValid()) {
    return 0;
  }

  if (halfDay) {
    return startDate.isSame(endDate, 'day') ? 0.5 : 0;
  }

  const start = startDate.startOf('day');
  const end = endDate.startOf('day');
  if (end.isBefore(start)) {
    return 0;
  }

  let count = 0;
  for (let cursor = start; !cursor.isAfter(end, 'day'); cursor = cursor.add(1, 'day')) {
    if (cursor.day() !== 0) {
      count += 1;
    }
  }

  return count;
}

export function buildEmployeeSelectOptions(
  employees: EmployeeOption[],
  isAdminUser: boolean
): EmployeeOption[] {
  const activeEmployees = employees.filter(isActiveEmployeeOption);
  return isAdminUser ? activeEmployees : [SELF_OPTION, ...activeEmployees];
}

export function isActiveEmployeeOption(employee: EmployeeOption): boolean {
  if (employee.id === SELF_EMPLOYEE_ID) {
    return true;
  }

  const status = employee.status ?? employee.employeeStatusType;
  if (status === undefined || status === null || status === '') {
    return false;
  }

  if (typeof status === 'number') {
    return status === EmployeeStatusType.Active;
  }

  const normalizedStatus = String(status).trim().toLowerCase();
  return normalizedStatus === 'active' || normalizedStatus === String(EmployeeStatusType.Active);
}

export function isAdminFromProfile(profile: any): boolean {
  if (!profile) {
    return false;
  }

  const role = profile?.role;
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === 'admin');
  }

  return String(role || '').toLowerCase() === 'admin';
}

export function getLeaveCenterVisibleTabs(
  context: LeaveCenterContext,
  canReviewLeaves: boolean
): LeaveCenterTab[] {
  if (canReviewLeaves) {
    return ['balance', 'my-requests', 'approvals'];
  }
  return ['balance', 'my-requests'];
}

export function resolveLeaveCenterTab(
  requestedTab: LeaveCenterTab,
  visibleTabs: LeaveCenterTab[],
  fallbackTab: LeaveCenterTab
): LeaveCenterTab {
  if (visibleTabs.includes(requestedTab)) {
    return requestedTab;
  }

  if (visibleTabs.includes(fallbackTab)) {
    return fallbackTab;
  }

  return visibleTabs[0] ?? 'my-requests';
}

export function buildLeaveAttachmentDownloadPath(
  leaveRequestId: string,
  mode: LeaveAttachmentMode = 'hr'
): string {
  const encodedId = encodeURIComponent(leaveRequestId);
  return mode === 'self'
    ? `/leave-management/my/${encodedId}/attachment/download`
    : `/leave-management/${encodedId}/attachment/download`;
}

export function buildLeaveAttachmentDownloadUrl(
  leaveRequestId: string,
  mode: LeaveAttachmentMode = 'hr'
): string {
  const apiRoot = process.env.NEXT_PUBLIC_API_URL;
  const path = `/api${buildLeaveAttachmentDownloadPath(leaveRequestId, mode)}`;
  return apiRoot ? `${apiRoot.replace(/\/$/, '')}${path}` : path;
}

export function getLeaveAttachmentLabel(detail: any): string {
  return (
    detail?.attachmentFileName ||
    detail?.fileName ||
    (detail?.id ? `leave-attachment-${String(detail.id).slice(0, 8)}` : 'View attachment')
  );
}

export function isEmployeeSelectionValidForCreate(
  employee: EmployeeOption | null,
  isAdminUser: boolean
): boolean {
  if (!employee?.id) {
    return false;
  }

  if (isAdminUser) {
    return employee.id !== SELF_EMPLOYEE_ID;
  }

  return true;
}

export function resolveAcademicYearIdForLeaveDate(
  leaveStartDate: dayjs.Dayjs | null,
  academicYears: AcademicYear[],
  fallbackAcademicYearId?: string
): string | undefined {
  if (!leaveStartDate || !leaveStartDate.isValid()) {
    return fallbackAcademicYearId;
  }

  const selectedDate = dayjs(leaveStartDate.format('YYYY-MM-DD'));

  const matched = academicYears.find((year) => {
    const yearStart = parseApiDateWithoutTimezoneShift(year.startDate).startOf('day');
    const yearEnd = parseApiDateWithoutTimezoneShift(year.endDate).endOf('day');

    return (
      selectedDate.valueOf() >= yearStart.valueOf() && selectedDate.valueOf() <= yearEnd.valueOf()
    );
  });

  return matched?.id || fallbackAcademicYearId;
}

export function isDateWithinAcademicYear(
  date: dayjs.Dayjs | null,
  academicYear?: Pick<AcademicYear, 'startDate' | 'endDate'> | null
): boolean {
  if (!date || !date.isValid() || !academicYear?.startDate || !academicYear?.endDate) {
    return false;
  }

  const normalizedDate = dayjs(date.format('YYYY-MM-DD'));
  const yearStart = parseApiDateWithoutTimezoneShift(academicYear.startDate).startOf('day');
  const yearEnd = parseApiDateWithoutTimezoneShift(academicYear.endDate).endOf('day');

  return (
    normalizedDate.valueOf() >= yearStart.valueOf() && normalizedDate.valueOf() <= yearEnd.valueOf()
  );
}

export function getAcademicYearStartMonth(academicYearStartDate?: string): dayjs.Dayjs | null {
  if (!academicYearStartDate) {
    return null;
  }

  const start = parseApiDateWithoutTimezoneShift(academicYearStartDate);
  return start.isValid() ? start.startOf('month') : null;
}

export function shouldDisableMonthBeforeAcademicYearStart(
  candidateMonth: dayjs.Dayjs,
  academicYearStartDate?: string
): boolean {
  const startMonth = getAcademicYearStartMonth(academicYearStartDate);

  if (!startMonth || !candidateMonth?.isValid()) {
    return false;
  }

  if (candidateMonth.year() !== startMonth.year()) {
    return false;
  }

  return candidateMonth.month() < startMonth.month();
}

export { parseApiProblemDetail };
