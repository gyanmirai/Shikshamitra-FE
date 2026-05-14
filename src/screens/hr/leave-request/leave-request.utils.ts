import type { AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const LEAVE_TARGET_EMPLOYEE_REQUIRED = 'HR:Leave:020033';
export const SELF_EMPLOYEE_ID = 'self';
export const SELF_OPTION = { id: SELF_EMPLOYEE_ID, label: 'Self' } as const;

export type LeaveCenterContext = 'hr' | 'self';
export type LeaveCenterTab = 'my-requests' | 'approvals' | 'balance';
export type EmployeeOption = {
  id: string;
  label: string;
  status?: EmployeeStatusType | number | string | null;
  employeeStatusType?: EmployeeStatusType | number | string | null;
};

export interface LeaveRequestFormValuesForPayload {
  employee: EmployeeOption | null;
  leavePolicyId: string;
  leaveTypeId: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  reason: string;
  docs: unknown;
}

function parseApiDateWithoutTimezoneShift(input: string): dayjs.Dayjs {
  const dateOnly = String(input || '').slice(0, 10);
  return dayjs(dateOnly || input);
}

export function buildCreateLeaveRequestFormData(
  values: LeaveRequestFormValuesForPayload
): FormData {
  const formData = new FormData();

  if (values.employee && values.employee.id !== SELF_EMPLOYEE_ID) {
    formData.append('forEmployeeId', values.employee.id);
  }

  formData.append('leavePolicyId', values.leavePolicyId);
  formData.append('leaveTypeId', values.leaveTypeId);
  formData.append('startDate', dayjs(values.startDate).toISOString());
  formData.append('endDate', dayjs(values.endDate).toISOString());
  formData.append('reason', values.reason);

  const docs = values.docs as any;
  if (docs instanceof File) {
    formData.append('File', docs);
  } else if (Array.isArray(docs) && docs.length > 0 && docs[0] instanceof File) {
    formData.append('File', docs[0]);
  }

  return formData;
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
  if (context === 'hr' && canReviewLeaves) {
    return ['approvals'];
  }

  return ['my-requests', 'balance'];
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
