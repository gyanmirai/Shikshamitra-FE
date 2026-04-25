import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  SELF_OPTION,
  SELF_EMPLOYEE_ID,
  isAdminFromProfile,
  buildEmployeeSelectOptions,
  buildCreateLeaveRequestFormData,
} from 'src/screens/hr/leave-request/leave-request.utils';

describe('leave request payload mapping', () => {
  it('uses forEmployeeId for non-self selection and never sends employeeId', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBe('emp-123');
    expect(formData.get('employeeId')).toBeNull();
  });

  it('omits forEmployeeId for self selection', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: SELF_EMPLOYEE_ID, label: 'Self' },
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      reason: 'Personal work',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBeNull();
    expect(formData.get('employeeId')).toBeNull();
  });
});

describe('leave request employee options', () => {
  const employees = [
    { id: 'emp-1', label: 'Emp 1' },
    { id: 'emp-2', label: 'Emp 2' },
  ];

  it('hides self option for admin users', () => {
    const options = buildEmployeeSelectOptions(employees, true);
    expect(options).toEqual(employees);
    expect(options.find((x) => x.id === SELF_EMPLOYEE_ID)).toBeUndefined();
  });

  it('keeps self option for non-admin users', () => {
    const options = buildEmployeeSelectOptions(employees, false);
    expect(options[0]).toEqual(SELF_OPTION);
    expect(options).toHaveLength(3);
  });
});

describe('problem details parsing', () => {
  it('prefers detail over legacy nested message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        detail: 'Please select an employee to create leave.',
        error: { message: 'Legacy message' },
      },
    });

    expect(parsed.detail).toBe('Please select an employee to create leave.');
  });

  it('detects admin role from profile payload', () => {
    expect(isAdminFromProfile({ role: 'admin' })).toBe(true);
    expect(isAdminFromProfile({ role: ['teacher', 'admin'] })).toBe(true);
    expect(isAdminFromProfile({ role: 'teacher' })).toBe(false);
  });
});
