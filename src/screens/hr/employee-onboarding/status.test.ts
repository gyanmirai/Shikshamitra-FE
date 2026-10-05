import { it, expect, describe } from 'vitest';

import {
  getValidNextStatuses,
  EmployeeApplicationStatus,
  canFinalizeEmployeeApplication,
  getEmployeeApplicationStatusColor,
  getEmployeeApplicationStatusLabel,
  normalizeEmployeeApplicationStatus,
  canRegenerateEmployeeApplicationLink,
  canCopyEmployeeApplicationLink,
} from './status';

describe('staff application status utilities', () => {
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

  it('does not offer workflow progress before candidate submission', () => {
    expect(getValidNextStatuses(EmployeeApplicationStatus.InvitationSent)).toEqual([
      EmployeeApplicationStatus.InvitationSent,
      EmployeeApplicationStatus.Rejected,
      EmployeeApplicationStatus.Withdrawn,
    ]);
  });

  it.each([
    EmployeeApplicationStatus.Finalized,
    EmployeeApplicationStatus.Rejected,
    EmployeeApplicationStatus.Withdrawn,
  ])('keeps terminal status %s closed', (status) => {
    expect(getValidNextStatuses(status)).toEqual([status]);
  });

  it('regenerates invitation links only before submission', () => {
    expect(canRegenerateEmployeeApplicationLink(EmployeeApplicationStatus.InvitationSent)).toBe(
      true
    );
    expect(canRegenerateEmployeeApplicationLink(EmployeeApplicationStatus.Applied)).toBe(false);
    expect(canRegenerateEmployeeApplicationLink(EmployeeApplicationStatus.Rejected)).toBe(false);
  });

  it('disables copy link when application is finalized', () => {
    expect(canCopyEmployeeApplicationLink(EmployeeApplicationStatus.Applied)).toBe(true);
    expect(canCopyEmployeeApplicationLink(EmployeeApplicationStatus.InvitationSent)).toBe(true);
    expect(canCopyEmployeeApplicationLink(EmployeeApplicationStatus.Finalized)).toBe(false);
  });
});
