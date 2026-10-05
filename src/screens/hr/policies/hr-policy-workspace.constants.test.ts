import { it, expect, describe } from 'vitest';

import { HR_POLICY_TABS, getHRPolicyTab } from './hr-policy-workspace.constants';

describe('HR policy workspace tabs', () => {
  it('keeps visible policy tabs in the payroll policy workflow order', () => {
    expect(HR_POLICY_TABS.filter((tab) => !tab.disabled).map((tab) => tab.label)).toEqual([
      'Work Calendars',
      'Attendance Policies',
      'Leave Policies',
      'Payroll Policies',
      'Policy Assignments',
    ]);
  });

  it('looks up tabs by value for dedicated policy pages', () => {
    expect(getHRPolicyTab('attendance').label).toBe('Attendance Policies');
    expect(getHRPolicyTab('payroll').label).toBe('Payroll Policies');
    expect(getHRPolicyTab('assignments').label).toBe('Policy Assignments');
  });
});
