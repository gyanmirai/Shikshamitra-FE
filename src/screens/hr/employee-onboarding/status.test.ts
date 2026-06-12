import { it, expect, describe } from 'vitest';

import {
  EmployeeApplicationStatus,
  canFinalizeEmployeeApplication,
  getEmployeeApplicationStatusColor,
  getEmployeeApplicationStatusLabel,
  normalizeEmployeeApplicationStatus,
} from './status';

describe('employee application status utilities', () => {
  it('normalizes numeric and string status values', () => {
    expect(normalizeEmployeeApplicationStatus(1)).toBe(EmployeeApplicationStatus.Applied);
    expect(normalizeEmployeeApplicationStatus('1')).toBe(EmployeeApplicationStatus.Applied);
    expect(normalizeEmployeeApplicationStatus('ReadyForOnboarding')).toBe(
      EmployeeApplicationStatus.ReadyForOnboarding
    );
  });

  it('renders expected labels and colors', () => {
    expect(getEmployeeApplicationStatusLabel(EmployeeApplicationStatus.InvitationSent)).toBe(
      'Invitation sent'
    );
    expect(getEmployeeApplicationStatusColor(EmployeeApplicationStatus.Rejected)).toBe('error');
  });

  it('allows finalization only after candidate application progress', () => {
    expect(canFinalizeEmployeeApplication(EmployeeApplicationStatus.InvitationSent)).toBe(false);
    expect(canFinalizeEmployeeApplication(EmployeeApplicationStatus.Applied)).toBe(true);
    expect(canFinalizeEmployeeApplication(EmployeeApplicationStatus.Finalized)).toBe(false);
  });
});
