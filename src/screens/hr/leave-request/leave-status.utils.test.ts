import { it, expect, describe } from 'vitest';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import {
  getLeaveStatusLabel,
  normalizeLeaveStatus,
  getLeaveStatusFilterValue,
} from 'src/screens/hr/leave-request/leave-status.utils';

describe('leave status utils', () => {
  it('normalizes API status text to table filter values', () => {
    expect(getLeaveStatusFilterValue('REJECTED')).toBe(EmployeeLeaveStatusType.Rejected);
    expect(getLeaveStatusFilterValue('Rejected')).toBe(EmployeeLeaveStatusType.Rejected);
    expect(getLeaveStatusFilterValue(EmployeeLeaveStatusType.Rejected)).toBe(
      EmployeeLeaveStatusType.Rejected
    );
  });

  it('uses backend status names for reviewed and cancelled leave states', () => {
    expect(normalizeLeaveStatus('VIEWED')).toBe('REVIEWED');
    expect(getLeaveStatusLabel('REVIEWED')).toBe('Reviewed');
    expect(getLeaveStatusFilterValue('CANCELLED')).toBe(EmployeeLeaveStatusType.Cancelled);
  });
});
