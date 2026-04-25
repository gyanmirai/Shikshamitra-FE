import dayjs from 'dayjs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const LEAVE_TARGET_EMPLOYEE_REQUIRED = 'HR:Leave:020033';
export const SELF_EMPLOYEE_ID = 'self';
export const SELF_OPTION = { id: SELF_EMPLOYEE_ID, label: 'Self' } as const;

export type EmployeeOption = { id: string; label: string };

export interface LeaveRequestFormValuesForPayload {
  employee: EmployeeOption | null;
  leavePolicyId: string;
  leaveTypeId: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  reason: string;
  docs: unknown;
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
  } else if (Array.isArray(docs) && docs.length > 0) {
    formData.append('attachment', docs[0]);
  }

  return formData;
}

export function buildEmployeeSelectOptions(
  employees: EmployeeOption[],
  isAdminUser: boolean
): EmployeeOption[] {
  return isAdminUser ? employees : [SELF_OPTION, ...employees];
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

export { parseApiProblemDetail };
