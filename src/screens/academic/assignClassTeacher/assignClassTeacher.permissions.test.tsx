import type { ReactNode } from 'react';
import type { GrantedPermission } from 'src/utils/permissions';

import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import ClassTeacherAssignment from './assignClassTeacher';

const fixture = vi.hoisted(() => ({
  permissions: [] as GrantedPermission[],
  medium: { educationMediumStages: [{ id: 'organization-1', name: 'Primary' }] },
  rows: [],
  query: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select({
    auth: { permissions: fixture.permissions },
    globalState: { currentMedium: fixture.medium },
  }),
}));
vi.mock('src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi', () => ({
  useGetClassTeacherAssignmentsQuery: (...args: unknown[]) => {
    fixture.query(...args);
    return { data: fixture.rows, refetch: vi.fn() };
  },
  useGetClassTeacherAssignmentSummaryQuery: () => ({}),
  useGetClassTeacherEligibleTeachersQuery: () => ({ data: fixture.rows }),
  useGetClassTeacherAssignmentHistoryQuery: () => ({ data: fixture.rows }),
  useValidateClassTeacherAssignmentsMutation: () => [vi.fn(), {}],
  useUpdateClassTeacherAssignmentsMutation: () => [vi.fn(), {}],
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({ Label: ({ children }: { children: ReactNode }) => children }));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => null }));
vi.mock('@mui/icons-material', () => ({
  Save: () => null,
  History: () => null,
  FactCheck: () => null,
  RestartAlt: () => null,
  Close: () => null,
  AssignmentTurnedIn: () => null,
}));

describe('ClassTeacherAssignment permissions', () => {
  beforeEach(() => {
    fixture.permissions = [{ name: 'ClassManagement.ClassTeacherAssignment.View', isGranted: true }];
    fixture.query.mockClear();
  });

  it('allows viewing history without exposing any assignment write action', () => {
    render(<ClassTeacherAssignment />);

    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review & Confirm' })).not.toBeInTheDocument();
    expect(fixture.query).toHaveBeenLastCalledWith(
      { organizationId: 'organization-1' }, { skip: false }
    );
  });

  it('shows assignment write actions only with the exact Add grant', () => {
    fixture.permissions.push({ name: 'ClassManagement.ClassTeacherAssignment.Add', isGranted: true });
    render(<ClassTeacherAssignment />);

    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review & Confirm' })).toBeInTheDocument();
  });

  it('does not treat navigation visibility as view or write permission', () => {
    fixture.permissions = [{ name: 'Module.ClassManagement.ClassTeacherAssignment', isGranted: true }];
    render(<ClassTeacherAssignment />);

    expect(screen.queryByRole('button', { name: 'Save Draft' })).not.toBeInTheDocument();
    expect(fixture.query).toHaveBeenLastCalledWith(
      { organizationId: 'organization-1' }, { skip: true }
    );
  });
});
