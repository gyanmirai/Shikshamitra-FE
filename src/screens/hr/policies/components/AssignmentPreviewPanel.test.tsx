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
  it.each(['employee', 'group'])('never labels a cached %s current winner as fresh after a resolution error', (targetType) => {
    render(<AssignmentPreviewPanel ctx={{ ...ctx, assignmentForm: { ...ctx.assignmentForm, targetType },
      assignmentPreview: { policySource: targetType, payrollPolicy: { name: 'Fresh authorized payroll' }, attendancePolicy: {} },
      assignmentResolutionError: { status: 403 }, assignmentResolutionPreview: {
        current: { policySource: targetType, payrollPolicy: { name: 'Old cached payroll' }, attendancePolicy: {} },
      },
    } as any} />);
    const current = screen.getByText('Currently effective on 2026-10-01').parentElement!;
    expect(within(current).queryByText('Payroll: Old cached payroll')).not.toBeInTheDocument();
    expect(within(current).getByText('Current policies unavailable.')).toBeInTheDocument();
  });

  it.each(['employee', 'group'])('hides a cached %s current winner while the resolution is refreshing', (targetType) => {
    render(<AssignmentPreviewPanel ctx={{ ...ctx, assignmentForm: { ...ctx.assignmentForm, targetType },
      assignmentPreview: { policySource: targetType, payrollPolicy: { name: 'Fresh authorized payroll' }, attendancePolicy: {} },
      assignmentResolutionLoading: true, assignmentResolutionPreview: {
        current: { policySource: targetType, payrollPolicy: { name: 'Old cached payroll' }, attendancePolicy: {} },
      },
    } as any} />);
    const current = screen.getByText('Currently effective on 2026-10-01').parentElement!;
    expect(within(current).queryByText('Payroll: Old cached payroll')).not.toBeInTheDocument();
    expect(within(current).getByText('Resolving current policies...')).toBeInTheDocument();
  });
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

  it('shows the authoritative proposed winner even when the selected draft loses', () => {
    render(
      <AssignmentPreviewPanel
        ctx={
          {
            ...ctx,
            assignmentResolutionPreview: {
              isComplete: true,
              scope: 'selected_staff',
              current: {
                policySource: 'group',
                payrollPolicy: { name: 'Current winner' },
                attendancePolicy: { name: 'Current attendance' },
              },
              proposed: {
                policySource: 'employee',
                matchedPriority: 400,
                matchedTargetDisplayName: 'Staff override',
                payrollPolicy: { name: 'Winning payroll' },
                attendancePolicy: { name: 'Winning attendance' },
                leavePolicy: { policyTitle: 'Winning leave' },
              },
            },
          } as any
        }
      />
    );
    expect(screen.getByText('Payroll: Winning payroll')).toBeInTheDocument();
    expect(screen.getByText('Attendance: Winning attendance')).toBeInTheDocument();
    expect(screen.getByText('Leave: Winning leave')).toBeInTheDocument();
    expect(screen.getByText(/Source: Employee.*Staff override.*Priority 400/)).toBeInTheDocument();
    expect(screen.getByText('Payroll: Current winner')).toBeInTheDocument();
    expect(screen.getByText('Selected assignment values')).toBeInTheDocument();
    expect(screen.getByText('Payroll: Proposed payroll')).toBeInTheDocument();
  });

  it.each(['loading', 'error', 'tie'])(
    'does not reuse a cached proposed winner during %s',
    (state) => {
      render(
        <AssignmentPreviewPanel
          ctx={
            {
              ...ctx,
              assignmentResolutionLoading: state === 'loading',
              assignmentResolutionError:
                state === 'error' ? { message: 'Synthetic unavailable' } : undefined,
              assignmentResolutionPreview: {
                isComplete: state !== 'tie',
                unavailableReason: 'Final ID tie is unresolved.',
                proposed: { payrollPolicy: { name: 'Stale winner' }, attendancePolicy: {} },
              },
            } as any
          }
        />
      );
      expect(screen.queryByText('Payroll: Stale winner')).not.toBeInTheDocument();
      if (state === 'loading')
        expect(screen.getByText('Resolving proposed policies...')).toBeInTheDocument();
      if (state === 'error')
        expect(screen.getByText(/Proposed policies unavailable/)).toBeInTheDocument();
      if (state === 'tie')
        expect(screen.getByText('Final ID tie is unresolved.')).toBeInTheDocument();
    }
  );

  it('does not label a group-only current result as a selected staff result', () => {
    render(
      <AssignmentPreviewPanel
        ctx={
          {
            ...ctx,
            assignmentForm: { ...ctx.assignmentForm, targetType: 'group' },
            assignmentSampleEmployeeId: 'selected-staff',
            assignmentPreview: {
              policySource: 'group',
              payrollPolicy: { name: 'Wrong group-only current' },
            },
            assignmentResolutionError: { message: 'Sample not accessible' },
          } as any
        }
      />
    );
    expect(screen.queryByText('Payroll: Wrong group-only current')).not.toBeInTheDocument();
    expect(screen.getByText('Current policies unavailable.')).toBeInTheDocument();
  });
});
