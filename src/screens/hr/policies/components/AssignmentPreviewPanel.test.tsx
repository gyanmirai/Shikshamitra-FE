import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AssignmentPreviewPanel } from './AssignmentPolicyDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./HRPolicySharedUI', () => ({ SectionTable: () => null }));
const ctx = {
  assignmentForm: {
    targetType: 'employee',
    targetDisplayName: 'Synthetic staff',
    targetKey: 'staff',
    priority: '7',
    effectiveFrom: '2026-10-01',
    payrollPolicyId: 'new-payroll',
    attendancePolicyId: 'new-attendance',
    leavePolicyId: 'new-leave',
  },
  payroll: [{ id: 'new-payroll', name: 'Proposed payroll' }],
  attendance: [{ id: 'new-attendance', name: 'Proposed attendance' }],
  leavePolicies: [{ id: 'new-leave', policyTitle: 'Proposed leave' }],
};

describe('assignment current and proposal identity', () => {
  it.each([
    [true, null, 'Resolving current policies...'],
    [false, { message: 'Synthetic failure' }, 'Current policies unavailable.'],
    [false, null, 'Current policies not resolved.'],
  ])('does not invent current identity while unresolved', (loading, error, message) => {
    render(
      <AssignmentPreviewPanel
        ctx={{ ...ctx, assignmentPreviewLoading: loading, assignmentPreviewError: error } as any}
      />
    );
    const current = screen.getByText('Currently effective on 2026-10-01').parentElement!;
    expect(within(current).getByText(String(message))).toBeInTheDocument();
    expect(within(current).queryByText(/Proposed/)).not.toBeInTheDocument();
    expect(within(current).queryByText('Employee scope')).not.toBeInTheDocument();
    expect(screen.getByText('After this assignment (proposal)')).toBeInTheDocument();
  });

  it('uses only server-resolved policy names and source for the current bundle', () => {
    render(
      <AssignmentPreviewPanel
        ctx={
          {
            ...ctx,
            assignmentPreview: {
              policySource: 'group',
              matchedTargetDisplayName: 'Teaching group',
              matchedPriority: 100,
              payrollPolicy: { name: 'Current payroll' },
              attendancePolicy: { name: 'Current attendance' },
              leavePolicy: { policyTitle: 'Current leave' },
            },
          } as any
        }
      />
    );
    const current = screen.getByText('Currently effective on 2026-10-01').parentElement!;
    expect(within(current).getByText('Payroll: Current payroll')).toBeInTheDocument();
    expect(within(current).getByText('Attendance: Current attendance')).toBeInTheDocument();
    expect(within(current).getByText('Leave: Current leave')).toBeInTheDocument();
    expect(within(current).getByText('Teaching group')).toBeInTheDocument();
    expect(within(current).queryByText(/Proposed/)).not.toBeInTheDocument();
  });
});
