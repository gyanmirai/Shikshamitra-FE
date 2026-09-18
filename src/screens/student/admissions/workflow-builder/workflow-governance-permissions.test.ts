import { it, expect, describe } from 'vitest';

import { canDecideAdmissionWorkflow } from './workflow-governance-permissions';

describe('workflow governance permissions', () => {
  const submitted = { status: 4 as const, assignedApproverId: 'CHECKER-1' };

  it('allows only the assigned checker with approval permission to decide', () => {
    expect(canDecideAdmissionWorkflow(submitted, 'checker-1', true)).toBe(true);
    expect(canDecideAdmissionWorkflow(submitted, 'checker-2', true)).toBe(false);
    expect(canDecideAdmissionWorkflow(submitted, 'checker-1', false)).toBe(false);
    expect(canDecideAdmissionWorkflow(submitted, undefined, true)).toBe(false);
  });

  it('does not allow a decision outside submitted status', () => {
    expect(
      canDecideAdmissionWorkflow({ status: 5, assignedApproverId: 'checker-1' }, 'checker-1', true)
    ).toBe(false);
  });
});
