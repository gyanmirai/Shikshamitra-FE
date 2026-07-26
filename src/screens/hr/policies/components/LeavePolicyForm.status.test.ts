import { it, expect, describe } from 'vitest';

import { toLeavePolicyFormStatus, LEAVE_POLICY_FORM_STATUS_OPTIONS } from './LeavePolicyForm';

describe('LeavePolicyForm status choices', () => {
  it('keeps archival out of the normal create and edit workflow', () => {
    expect(LEAVE_POLICY_FORM_STATUS_OPTIONS).toEqual(['Active', 'Draft']);
    expect(LEAVE_POLICY_FORM_STATUS_OPTIONS).not.toContain('Archived');
    expect(toLeavePolicyFormStatus('Archived')).toBe('Active');
  });
});
