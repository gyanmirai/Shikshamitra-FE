import type React from 'react';

import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import { PolicyImpactDrawer } from './PolicyImpactDrawer';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AccordionSummary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AccordionDetails: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('./HRPolicySharedUI', () => ({
  DrawerHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
  EmptyRows: () => <tr />,
  SectionTable: ({ columns, children }: { columns: string[]; children: React.ReactNode }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  ),
}));

describe('PolicyImpactDrawer summary rendering', () => {
  it('uses one request status and leaves the idle state out of loading', () => {
    const ctx = {
      impactDrawerOpen: true,
      drawerTransitionDuration: 0,
      impactPreview: null,
      impactPreviewError: null,
      pendingImpactAction: null,
      previewPolicyImpactState: { isLoading: true },
      previewPolicyAssignmentImpactState: { isLoading: false },
      closeImpactDrawer: vi.fn(),
    } as any;
    const { rerender } = renderWithProviders(<PolicyImpactDrawer ctx={ctx} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading impact preview...');
    expect(screen.getAllByRole('progressbar', { hidden: true })).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(
      <PolicyImpactDrawer ctx={{ ...ctx, previewPolicyImpactState: { isLoading: false } }} />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Impact preview is not loaded yet.');
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();

    rerender(
      <PolicyImpactDrawer
        ctx={{
          ...ctx,
          previewPolicyImpactState: { isLoading: false },
          impactPreviewError: 'Preview could not be loaded.',
        }}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Preview could not be loaded.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows risk summary and recommended action from impact preview', () => {
    renderWithProviders(
      <PolicyImpactDrawer
        ctx={
          {
            impactDrawerOpen: true,
            drawerTransitionDuration: 0,
            impactPreviewError: null,
            pendingImpactAction: null,
            isPolicyOperationActive: false,
            activePolicyOperation: null,
            previewPolicyImpactState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            closeImpactDrawer: vi.fn(),
            confirmPendingImpactAction: vi.fn(),
            impactPreview: {
              policyType: 'assignment',
              action: 'create',
              currentVersion: null,
              proposedVersion: 1,
              affectedEmployeeCount: 3,
              affectedAssignmentCount: 1,
              lockedPayrollMonths: [],
              affectedEmployees: [],
              affectedPayrollMonths: [],
              affectedAttendanceEvaluationMonths: [],
              hasStalePayrollRisk: false,
              warnings: [],
              blockingWarnings: [],
              effectiveAssignmentConflicts: [],
              requiresConfirmation: false,
              resolutionSummary: '3 staff members and 1 assignment(s) may be affected.',
              riskSummary: 'No policy risks detected for this action.',
              recommendedAction: 'This action can be saved after normal review.',
            },
          } as any
        }
      />
    );

    expect(screen.getByText(/3 staff members/)).toBeInTheDocument();
    expect(screen.getByText(/No policy risks detected/)).toBeInTheDocument();
    expect(screen.getByText(/normal review/)).toBeInTheDocument();
  });

  it('shows warning and blocking warning messages from impact preview', () => {
    renderWithProviders(
      <PolicyImpactDrawer
        ctx={
          {
            impactDrawerOpen: true,
            drawerTransitionDuration: 0,
            impactPreviewError: null,
            pendingImpactAction: null,
            isPolicyOperationActive: false,
            activePolicyOperation: null,
            previewPolicyImpactState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            closeImpactDrawer: vi.fn(),
            confirmPendingImpactAction: vi.fn(),
            impactPreview: {
              policyType: 'payroll',
              action: 'update',
              currentVersion: 2,
              proposedVersion: 3,
              affectedEmployeeCount: 0,
              affectedAssignmentCount: 0,
              lockedPayrollMonths: [],
              affectedEmployees: [],
              affectedPayrollMonths: [],
              affectedAttendanceEvaluationMonths: [],
              hasStalePayrollRisk: false,
              warnings: [
                {
                  severity: 'warning',
                  code: 'ShikshaMitra:WorkCalendarPolicyMustBeActive',
                  message: 'The referenced work calendar is draft.',
                },
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:InvalidWorkCalendarPolicy',
                  message: 'The referenced work calendar could not be found.',
                },
              ],
              blockingWarnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:InvalidWorkCalendarPolicy',
                  message: 'The referenced work calendar could not be found.',
                },
              ],
              effectiveAssignmentConflicts: [],
              requiresConfirmation: false,
              riskSummary: '1 blocking issue(s) must be resolved before this action can continue.',
              recommendedAction: 'Resolve the blocking warnings, then run impact preview again.',
            },
          } as any
        }
      />
    );

    expect(screen.getByText('The referenced work calendar is draft.')).toBeInTheDocument();
    expect(
      screen.getByText('The referenced work calendar could not be found.')
    ).toBeInTheDocument();
    expect(screen.getByText(/1 blocking issue/)).toBeInTheDocument();
    expect(screen.getByText(/Resolve the blocking warnings/)).toBeInTheDocument();
  });

  it('shows explicit blocking warnings even when warnings are empty', () => {
    renderWithProviders(
      <PolicyImpactDrawer
        ctx={
          {
            impactDrawerOpen: true,
            drawerTransitionDuration: 0,
            impactPreviewError: null,
            pendingImpactAction: { label: 'Archive policy', run: vi.fn() },
            isPolicyOperationActive: false,
            activePolicyOperation: null,
            previewPolicyImpactState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            closeImpactDrawer: vi.fn(),
            confirmPendingImpactAction: vi.fn(),
            impactPreview: {
              policyType: 'attendance',
              action: 'archive',
              currentVersion: 1,
              proposedVersion: 2,
              affectedEmployeeCount: 0,
              affectedAssignmentCount: 0,
              lockedPayrollMonths: [],
              affectedEmployees: [],
              affectedPayrollMonths: [],
              affectedAttendanceEvaluationMonths: [],
              hasStalePayrollRisk: false,
              warnings: [],
              blockingWarnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:PolicyArchiveBlocked',
                  message: 'This policy is still referenced by active assignments.',
                },
              ],
              effectiveAssignmentConflicts: [],
              requiresConfirmation: false,
              riskSummary: '1 blocking issue(s) must be resolved before this action can continue.',
              recommendedAction: 'Resolve the blocking warnings, then run impact preview again.',
            },
          } as any
        }
      />
    );

    expect(
      screen.getByText('This policy is still referenced by active assignments.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm archive policy/i })).toBeDisabled();
  });

  it('shows the conflicting assignment identity and a direct review action', () => {
    const closeImpactDrawer = vi.fn();
    const openAssignmentDrawer = vi.fn();
    renderWithProviders(
      <PolicyImpactDrawer
        ctx={
          {
            impactDrawerOpen: true,
            drawerTransitionDuration: 0,
            impactPreviewError: null,
            pendingImpactAction: null,
            isPolicyOperationActive: false,
            activePolicyOperation: null,
            previewPolicyImpactState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            closeImpactDrawer,
            confirmPendingImpactAction: vi.fn(),
            openAssignmentDrawer,
            impactPreview: {
              policyType: 'assignment',
              academicYearId: 'academic-year-1',
              action: 'update',
              affectedEmployeeCount: 1,
              affectedAssignmentCount: 1,
              lockedPayrollMonths: [],
              affectedEmployees: [],
              affectedPayrollMonths: [],
              affectedAttendanceEvaluationMonths: [],
              hasStalePayrollRisk: false,
              warnings: [],
              blockingWarnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:HrPolicyAssignmentOverlap',
                  message: 'Conflicts with active assignment assignment-1 for Keyur Siddhapura.',
                  conflict: {
                    assignmentId: 'assignment-1',
                    targetType: 'employee',
                    targetKey: 'employee-1',
                    targetDisplayName: 'Keyur Siddhapura',
                    payrollPolicyId: 'payroll-1',
                    payrollPolicyName: 'Standard Payroll',
                    attendancePolicyId: 'attendance-1',
                    attendancePolicyName: 'Standard Attendance',
                    effectiveFrom: '2026-01-01',
                    effectiveTo: null,
                    priority: 100,
                    suggestedFixes: [],
                  },
                },
              ],
              effectiveAssignmentConflicts: [],
              requiresConfirmation: false,
            },
          } as any
        }
      />
    );

    expect(screen.getByText(/Keyur Siddhapura/)).toBeInTheDocument();
    expect(screen.getByText(/Reference ID: ASSIGNME/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View conflict' }));
    expect(closeImpactDrawer).toHaveBeenCalledOnce();
    expect(openAssignmentDrawer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'assignment-1', targetDisplayName: 'Keyur Siddhapura' }),
      'view'
    );
  });

  it('formats effective assignment conflict candidate reasons for admins', () => {
    renderWithProviders(
      <PolicyImpactDrawer
        ctx={
          {
            impactDrawerOpen: true,
            drawerTransitionDuration: 0,
            impactPreviewError: null,
            pendingImpactAction: null,
            isPolicyOperationActive: false,
            activePolicyOperation: null,
            previewPolicyImpactState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            closeImpactDrawer: vi.fn(),
            confirmPendingImpactAction: vi.fn(),
            impactPreview: {
              policyType: 'assignment',
              action: 'create',
              currentVersion: null,
              proposedVersion: 1,
              affectedEmployeeCount: 1,
              affectedAssignmentCount: 1,
              lockedPayrollMonths: [],
              affectedEmployees: [],
              affectedPayrollMonths: [],
              affectedAttendanceEvaluationMonths: [],
              hasStalePayrollRisk: false,
              warnings: [],
              blockingWarnings: [],
              effectiveAssignmentConflicts: [
                {
                  employeeId: 'employee-1',
                  employeeCode: 'E-001',
                  employeeName: 'Ananya Rao',
                  date: '2026-05-01',
                  winningAssignment: {
                    assignmentId: null,
                    targetType: 'group',
                    targetKey: 'later-group',
                    targetDisplayName: 'Later group',
                    payrollPolicyId: 'payroll-1',
                    payrollPolicyName: 'Payroll',
                    attendancePolicyId: 'attendance-1',
                    attendancePolicyName: 'Attendance',
                    effectiveFrom: '2026-05-01',
                    effectiveTo: null,
                    priority: 100,
                    status: 'matched',
                    skipReason: 'winner',
                  },
                  candidateAssignments: [
                    {
                      assignmentId: 'assignment-1',
                      targetType: 'group',
                      targetKey: 'earlier-group',
                      targetDisplayName: 'Earlier group',
                      payrollPolicyId: 'payroll-1',
                      payrollPolicyName: 'Payroll',
                      attendancePolicyId: 'attendance-1',
                      attendancePolicyName: 'Attendance',
                      effectiveFrom: '2026-04-01',
                      effectiveTo: null,
                      priority: 100,
                      status: 'skipped',
                      skipReason: 'lower_effective_date',
                    },
                  ],
                },
              ],
              requiresConfirmation: false,
              riskSummary: 'No policy risks detected for this action.',
              recommendedAction: 'This action can be saved after normal review.',
            },
          } as any
        }
      />
    );

    expect(screen.getByText(/Earlier group \(Skipped: Lower Effective Date\)/)).toBeInTheDocument();
  });
});
