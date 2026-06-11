import type React from 'react';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'src/test/test-utils';

import { AssignmentsTab } from './AssignmentsTab';

vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: () => <input aria-label="date" readOnly />,
}));

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
  it('opens assignment view mode from the eye action', async () => {
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
            assignmentFilters: {
              search: '',
              targetType: 'all',
              status: 'all',
              payrollPolicyId: '',
              attendancePolicyId: '',
              activeOnDate: '',
              effectiveFrom: '',
              effectiveTo: '',
            },
            setAssignmentFilters: vi.fn(),
            assignmentFilterAnchorEl: null,
            setAssignmentFilterAnchorEl: vi.fn(),
            draftAssignmentFilters: {
              search: '',
              targetType: 'all',
              status: 'all',
              payrollPolicyId: '',
              attendancePolicyId: '',
              activeOnDate: '',
              effectiveFrom: '',
              effectiveTo: '',
            },
            setDraftAssignmentFilters: vi.fn(),
            assignmentsLoading: false,
            assignmentsError: null,
            activePayroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            activeAttendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
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

    await user.click(screen.getByTestId('table-action-view'));

    expect(openAssignmentDrawer).toHaveBeenCalledWith(assignment, 'view');
    expect(previewAssignment).not.toHaveBeenCalled();
  });
});
