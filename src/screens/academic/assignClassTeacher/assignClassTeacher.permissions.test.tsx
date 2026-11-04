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
  queryState: {} as Record<string, unknown>,
  saving: false,
  validating: false,
  table: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: { permissions: fixture.permissions },
      globalState: { currentMedium: fixture.medium },
    }),
}));
vi.mock('src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi', () => ({
  useGetClassTeacherWorkspaceQuery: (...args: unknown[]) => {
    fixture.query(...args);
    const data = { items: fixture.rows, eligibleTeachers: fixture.rows };
    return { data, currentData: data, refetch: vi.fn(), ...fixture.queryState };
  },
  useGetClassTeacherAssignmentSummaryQuery: () => ({}),
  useGetClassTeacherEligibleTeachersQuery: () => ({ data: fixture.rows }),
  useGetClassTeacherAssignmentHistoryQuery: () => ({ data: fixture.rows }),
  useValidateClassTeacherAssignmentsMutation: () => [vi.fn(), { isLoading: fixture.validating }],
  useUpdateClassTeacherAssignmentsMutation: () => [vi.fn(), { isLoading: fixture.saving }],
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/screens/academic/components/AcademicContextContent', () => ({
  AcademicContextContent: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: unknown) => {
    fixture.table(props);
    return null;
  },
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/label', () => ({
  Label: ({ children }: { children: ReactNode }) => children,
}));
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
    fixture.permissions = [
      { name: 'ClassManagement.ClassTeacherAssignment.View', isGranted: true },
    ];
    fixture.query.mockClear();
    fixture.table.mockClear();
    fixture.queryState = {};
    fixture.saving = false;
    fixture.validating = false;
  });

  it('allows viewing history without exposing any assignment write action', () => {
    render(<ClassTeacherAssignment />);

    expect(screen.getByRole('button', { name: 'History' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review & confirm' })).not.toBeInTheDocument();
    expect(fixture.query).toHaveBeenLastCalledWith(
      { organizationId: 'organization-1' },
      { skip: false }
    );
  });

  it('shows assignment write actions only with the exact Add grant', () => {
    fixture.permissions.push({
      name: 'ClassManagement.ClassTeacherAssignment.Add',
      isGranted: true,
    });
    render(<ClassTeacherAssignment />);

    expect(screen.getByRole('button', { name: 'Save draft' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review & confirm' })).toBeInTheDocument();
  });

  it('does not treat navigation visibility as view or write permission', () => {
    fixture.permissions = [
      { name: 'Module.ClassManagement.ClassTeacherAssignment', isGranted: true },
    ];
    render(<ClassTeacherAssignment />);

    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    expect(fixture.query).toHaveBeenLastCalledWith(
      { organizationId: 'organization-1' },
      { skip: true }
    );
  });

  it.each(['saving', 'validating'] as const)('locks scope actions while %s', (operation) => {
    fixture[operation] = true;
    fixture.permissions.push({
      name: 'ClassManagement.ClassTeacherAssignment.Add',
      isGranted: true,
    });
    render(<ClassTeacherAssignment />);

    expect(screen.getByRole('button', { name: 'History' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeDisabled();
  });

  it('distinguishes workspace failure from a successful empty result and provides retry', () => {
    fixture.queryState = { isError: true, error: { status: 500 } };
    render(<ClassTeacherAssignment />);

    expect(fixture.table).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: { status: 500 },
        onRetry: expect.any(Function),
      })
    );
    expect(screen.queryByText('All class divisions are assigned.')).not.toBeInTheDocument();
  });

  it('keeps same-scope rows mounted during refresh', () => {
    fixture.queryState = { isFetching: true };
    render(<ClassTeacherAssignment />);

    expect(fixture.table).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isLoading: false,
        isRefreshing: true,
      })
    );
  });
});
