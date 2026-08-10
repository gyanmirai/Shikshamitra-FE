import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { AdmissionYearSetup } from './admission-year-setup';

const apiMocks = vi.hoisted(() => ({
  versionsQuery: vi.fn(),
  standardsQuery: vi.fn(),
  staffQuery: vi.fn(),
  createDraftMutation: vi.fn(),
  updateDraftMutation: vi.fn(),
  publishMutation: vi.fn(),
  closeMutation: vi.fn(),
}));

vi.mock('src/redux/student/admissions-crm/setup-playbooks-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/setup-playbooks-api')>();

  return {
    ...actual,
    useGetAdmissionCrmAdmissionYearVersionsQuery: (...args: unknown[]) =>
      apiMocks.versionsQuery(...args),
    useCreateAdmissionCrmAdmissionYearDraftMutation: () => apiMocks.createDraftMutation(),
    useUpdateAdmissionCrmAdmissionYearDraftMutation: () => apiMocks.updateDraftMutation(),
    usePublishAdmissionCrmAdmissionYearMutation: () => apiMocks.publishMutation(),
    useCloseAdmissionCrmAdmissionYearMutation: () => apiMocks.closeMutation(),
  };
});

vi.mock('src/redux/student/admissions-crm/operations-governance-api', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('src/redux/student/admissions-crm/operations-governance-api')
    >();
  return {
    ...actual,
    useGetAdmissionCrmAdmissionYearStandardOptionsQuery: (...args: unknown[]) =>
      apiMocks.standardsQuery(...args),
  };
});

vi.mock('src/redux/student/admissions-crm/core-leads-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/core-leads-api')>();
  return {
    ...actual,
    useGetAdmissionCrmStaffQuery: (...args: unknown[]) => apiMocks.staffQuery(...args),
  };
});

vi.mock('../admissions-crm/enrollment-workspace-context', () => ({
  useEnrollmentWorkspace: () => ({
    academicYearId: 'year-1',
    academicYearName: '2026-27',
  }),
}));

vi.mock('./enrollment-settings-page', () => ({
  EnrollmentSettingsPage: ({ title, children }: { title: string; children: ReactNode }) => (
    <main>
      <header>
        <h1>{title}</h1>
      </header>
      {children}
    </main>
  ),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    isLoading,
    tableContainerProps,
  }: {
    isLoading?: boolean;
    tableContainerProps?: { sx?: { height?: string } };
  }) => (
    <div
      data-testid="version-history"
      data-loading={String(Boolean(isLoading))}
      data-height={tableContainerProps?.sx?.height}
    />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

describe('Admission Year Setup query safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.versionsQuery.mockReturnValue(queryResult());
    apiMocks.standardsQuery.mockReturnValue(queryResult());
    apiMocks.staffQuery.mockReturnValue(queryResult());
    apiMocks.createDraftMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiMocks.updateDraftMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiMocks.publishMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiMocks.closeMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  });

  it('blocks setup actions and content during the required initial loads', () => {
    apiMocks.versionsQuery.mockReturnValue(queryResult({ isLoading: true, isFetching: true }));
    apiMocks.standardsQuery.mockReturnValue(queryResult({ isLoading: true, isFetching: true }));
    apiMocks.staffQuery.mockReturnValue(queryResult({ isLoading: true, isFetching: true }));

    render(<AdmissionYearSetup />);

    const startSetup = screen.getByRole('button', { name: 'Start setup' });
    expect(startSetup).toBeDisabled();
    expect(screen.getByTestId('admission-year-context')).toContainElement(startSetup);
    expect(
      screen.getByRole('progressbar', { name: 'Loading Admission Year Setup' })
    ).toBeInTheDocument();
    expect(screen.getByText('Selected academic year')).toBeInTheDocument();
    expect(screen.getByTestId('version-history')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('version-history')).toHaveAttribute('data-height', '100%');
  });

  it('fails closed without rendering stale setup or version-history content', () => {
    apiMocks.standardsQuery.mockReturnValue(queryResult({ isError: true }));

    render(<AdmissionYearSetup />);

    expect(screen.queryByRole('button', { name: 'Start setup' })).not.toBeInTheDocument();
    expect(screen.getByText('Admission Year Setup could not be loaded.')).toBeInTheDocument();
    expect(screen.queryByText('Selected academic year')).not.toBeInTheDocument();
    expect(screen.queryByTestId('version-history')).not.toBeInTheDocument();
  });
});
