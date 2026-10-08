import { describe, expect, it } from 'vitest';

import { isFinanceAdministratorSession } from './finance-admin-auto-approval';

describe('isFinanceAdministratorSession', () => {
  it('recognizes configured administrator role claims', () => {
    expect(isFinanceAdministratorSession({ profile: { role: 'admin' } })).toBe(true);
    expect(isFinanceAdministratorSession({ profile: { role: ['teacher', 'super-admin'] } })).toBe(true);
  });

  it('keeps ordinary finance approvers out of the administrator confirmation', () => {
    expect(isFinanceAdministratorSession({ profile: { role: 'finance-approver' } })).toBe(false);
    expect(isFinanceAdministratorSession(null)).toBe(false);
  });
});
