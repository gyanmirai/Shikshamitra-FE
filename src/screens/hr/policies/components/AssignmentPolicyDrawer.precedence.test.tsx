import type React from 'react';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'src/test/test-utils';

import { AssignmentPolicyDrawer } from './AssignmentPolicyDrawer';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Paper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label }: { label?: string }) => <input aria-label={label || 'date'} readOnly />,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('./HRPolicySharedUI', () => ({
  DrawerField: ({
    label,
    helperText,
    children,
  }: {
    label: string;
    helperText?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      {children}
      {helperText ? <small>{helperText}</small> : null}
    </div>
  ),
  DrawerHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
  DrawerFormGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerSelectField: ({
    label,
    value,
    disabled,
    children,
  }: {
    label: string;
    value: string;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      <div data-value={value} data-disabled={disabled ? 'true' : 'false'}>
        {children}
      </div>
    </div>
  ),
  SectionTable: ({ children }: { children: React.ReactNode }) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
}));

describe('AssignmentPolicyDrawer precedence copy', () => {
  it('shows the resolver precedence used by backend assignment resolution', () => {
    renderWithProviders(
      <AssignmentPolicyDrawer
        ctx={
          {
            drawer: { kind: 'assignment', mode: 'create' },
            formError: '',
            assignmentForm: {
              targetType: 'employee',
              targetKey: 'employee-1',
              targetDisplayName: 'Asha Teacher',
              payrollPolicyId: 'payroll-1',
              attendancePolicyId: 'attendance-1',
              effectiveFrom: '2026-06-01',
              effectiveTo: '',
              priority: '100',
              assignmentReason: '',
              isActive: true,
            },
            setAssignmentForm: vi.fn(),
            assignmentConflict: null,
            assignmentDateError: '',
            setAssignmentDateError: vi.fn(),
            assignmentPreview: null,
            assignmentPreviewLoading: false,
            assignmentPreviewError: null,
            payroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            attendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            activePayroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            activeAttendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            employeeOptions: [{ id: 'employee-1', label: 'Asha Teacher' }],
            groupOptions: [],
            academicYearId: 'ay-2026',
            activePolicyOperation: null,
            isPolicyOperationActive: false,
            createAssignmentState: { isLoading: false },
            updateAssignmentState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            canAssignPolicy: true,
            canPreviewImpact: true,
            closeDrawer: vi.fn(),
            saveAssignment: vi.fn(),
            previewCurrentAssignmentImpact: vi.fn(),
            previewAssignment: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.getByText('Precedence: Employee > Group > Default')).toBeInTheDocument();
    expect(screen.queryByText(/Shift > Role > Department/)).not.toBeInTheDocument();
  });

  it('renders assignment view mode without submit controls', () => {
    renderWithProviders(
      <AssignmentPolicyDrawer
        ctx={
          {
            drawer: { kind: 'assignment', mode: 'view' },
            formError: '',
            assignmentForm: {
              targetType: 'group',
              targetKey: 'group-1',
              targetDisplayName: 'Teaching Staff',
              payrollPolicyId: 'payroll-1',
              attendancePolicyId: 'attendance-1',
              effectiveFrom: '2026-06-01',
              effectiveTo: '2027-05-31',
              priority: '10',
              assignmentReason: 'Seeded assignment',
              isActive: true,
            },
            setAssignmentForm: vi.fn(),
            assignmentConflict: null,
            assignmentDateError: '',
            setAssignmentDateError: vi.fn(),
            assignmentPreview: null,
            assignmentPreviewLoading: false,
            assignmentPreviewError: null,
            payroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            attendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            activePayroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            activeAttendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            employeeOptions: [],
            groupOptions: [{ id: 'group-1', label: 'Teaching Staff' }],
            academicYearId: 'ay-2026',
            activePolicyOperation: null,
            isPolicyOperationActive: false,
            createAssignmentState: { isLoading: false },
            updateAssignmentState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            canAssignPolicy: true,
            canPreviewImpact: true,
            closeDrawer: vi.fn(),
            saveAssignment: vi.fn(),
            previewCurrentAssignmentImpact: vi.fn(),
            previewAssignment: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.getByText('View Assignment')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('shows the backend member count for group assignment options', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AssignmentPolicyDrawer
        ctx={
          {
            drawer: { kind: 'assignment', mode: 'create' },
            formError: '',
            assignmentForm: {
              targetType: 'group',
              targetKey: '',
              targetDisplayName: '',
              payrollPolicyId: 'payroll-1',
              attendancePolicyId: 'attendance-1',
              effectiveFrom: '2026-06-01',
              effectiveTo: '',
              priority: '100',
              assignmentReason: '',
              isActive: true,
            },
            setAssignmentForm: vi.fn(),
            assignmentConflict: null,
            assignmentDateError: '',
            setAssignmentDateError: vi.fn(),
            assignmentPreview: null,
            assignmentPreviewLoading: false,
            assignmentPreviewError: null,
            payroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            attendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            activePayroll: [{ id: 'payroll-1', name: 'Teacher Payroll' }],
            activeAttendance: [{ id: 'attendance-1', name: 'Teacher Attendance' }],
            employeeOptions: [],
            groupOptions: [
              {
                id: 'group-1',
                name: 'Teaching Staff',
                memberCount: 2,
                employeeCount: 2,
              },
            ],
            academicYearId: 'ay-2026',
            activePolicyOperation: null,
            isPolicyOperationActive: false,
            createAssignmentState: { isLoading: false },
            updateAssignmentState: { isLoading: false },
            previewPolicyAssignmentImpactState: { isLoading: false },
            canAssignPolicy: true,
            canPreviewImpact: true,
            closeDrawer: vi.fn(),
            saveAssignment: vi.fn(),
            previewCurrentAssignmentImpact: vi.fn(),
            previewAssignment: vi.fn(),
          } as any
        }
      />
    );

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Teaching Staff')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
    expect(screen.queryByText('0 members')).not.toBeInTheDocument();
  });
});
