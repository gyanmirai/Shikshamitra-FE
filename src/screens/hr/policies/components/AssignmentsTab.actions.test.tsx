import type React from 'react';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'src/test/test-utils';

import { AssignmentsTab } from './AssignmentsTab';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/three-dots-actions', () => ({
  default: ({
    showViewIcon,
    showEditIcon,
    handleViewClick,
    handleEditClick,
  }: {
    showViewIcon?: boolean;
    showEditIcon?: boolean;
    handleViewClick?: () => void;
    handleEditClick?: () => void;
  }) => (
    <div>
      {showViewIcon ? (
        <button type="button" data-testid="table-action-view" onClick={handleViewClick}>
          View
        </button>
      ) : null}
      {showEditIcon ? (
        <button type="button" data-testid="table-action-edit" onClick={handleEditClick}>
          Edit
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: { columns: any[]; data: any[] }) => {
    const actionColumn = columns.find((column) => column.id === 'actions');
    return (
      <div>
        {data.map((row) => (
          <div key={row.id}>{actionColumn?.render?.(null, row) as React.ReactNode}</div>
        ))}
      </div>
    );
  },
}));

describe('AssignmentsTab actions', () => {
  it('keeps new, view and edit actions without the advanced filter UI', async () => {
    const user = userEvent.setup();
    const assignment = {
      id: 'assignment-1',
      academicYearId: 'ay-2026',
      targetType: 'group',
      targetKey: 'group-1',
      targetDisplayName: 'Teaching Staff',
      payrollPolicyId: 'payroll-1',
      attendancePolicyId: 'attendance-1',
      effectiveFrom: '2026-06-01',
      effectiveTo: '2027-05-31',
      priority: 10,
      isActive: true,
      assignmentReason: 'Seeded assignment',
    };
    const openAssignmentDrawer = vi.fn();
    const previewAssignment = vi.fn();

    renderWithProviders(
      <AssignmentsTab
        ctx={
          {
            academicYearId: 'ay-2026',
            assignmentRows: [
              {
                id: assignment.id,
                assignment,
                target: 'Teaching Staff',
                targetKey: 'group-1',
                organization: '-',
                sourceType: 'Group',
                payrollPolicyName: 'Teacher Payroll',
                attendancePolicyName: 'Teacher Attendance',
                effective: '01 Jun 2026 - 31 May 2027',
                priority: 10,
                status: 'Active',
                reason: 'Seeded assignment',
              },
            ],
            assignmentPage: { number: 1, size: 20 },
            setAssignmentPage: vi.fn(),
            assignmentTotal: 1,
            assignmentSearch: '',
            setAssignmentSearch: vi.fn(),
            assignmentsLoading: false,
            assignmentsError: null,
            activePayroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            activeAttendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            activeLeavePolicies: [{ id: 'leave-1', name: 'Teacher Leave' }],
            payroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            attendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            canAssignPolicy: true,
            canViewAudit: false,
            openAssignmentDrawer,
            openEntityAudit: vi.fn(),
            previewAssignment,
            deleteAssignment: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.queryByText(/advanced filters/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('table-action-view'));

    expect(openAssignmentDrawer).toHaveBeenCalledWith(assignment, 'view');
    expect(previewAssignment).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('table-action-edit'));
    expect(openAssignmentDrawer).toHaveBeenLastCalledWith(assignment);
    await user.click(screen.getByRole('button', { name: 'New Assignment' }));
    expect(openAssignmentDrawer).toHaveBeenLastCalledWith();
  });

  it('retains view access but prevents new and edit actions without assignment permission', () => {
    renderWithProviders(
      <AssignmentsTab
        ctx={
          {
            academicYearId: 'ay-2026',
            assignmentRows: [{ id: 'assignment-1', assignment: { id: 'assignment-1' } }],
            assignmentPage: { number: 1, size: 20 },
            assignmentSearch: '',
            activePayroll: [{ id: 'payroll-1' }],
            activeAttendance: [{ id: 'attendance-1' }],
            activeLeavePolicies: [{ id: 'leave-1' }],
            canAssignPolicy: false,
            openAssignmentDrawer: vi.fn(),
          } as any
        }
      />
    );
    expect(screen.getByRole('button', { name: 'New Assignment' })).toBeDisabled();
    expect(screen.getByTestId('table-action-view')).toBeVisible();
    expect(screen.queryByTestId('table-action-edit')).not.toBeInTheDocument();
  });
});

vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
