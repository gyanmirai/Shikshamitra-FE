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

vi.mock('src/redux/student/admissions-crm/admissions-crm-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/admissions-crm-api')>();

  return {
    ...actual,
    useGetAdmissionCrmAdmissionYearVersionsQuery: (...args: unknown[]) =>
      apiMocks.versionsQuery(...args),
    useGetAdmissionCrmAdmissionYearStandardOptionsQuery: (...args: unknown[]) =>
      apiMocks.standardsQuery(...args),
    useGetAdmissionCrmStaffQuery: (...args: unknown[]) => apiMocks.staffQuery(...args),
    useCreateAdmissionCrmAdmissionYearDraftMutation: () => apiMocks.createDraftMutation(),
    useUpdateAdmissionCrmAdmissionYearDraftMutation: () => apiMocks.updateDraftMutation(),
    usePublishAdmissionCrmAdmissionYearMutation: () => apiMocks.publishMutation(),
    useCloseAdmissionCrmAdmissionYearMutation: () => apiMocks.closeMutation(),
  };
});

vi.mock('../admissions-crm/enrollment-workspace-context', () => ({
  useEnrollmentWorkspace: () => ({
    academicYearId: 'year-1',
    academicYearName: '2026-27',
  }),
}));

vi.mock('../admissions-crm/workspace-header', () => ({
  EnrollmentWorkspaceHeader: ({ title, actions }: { title: string; actions?: ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {actions}
    </header>
  ),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ isLoading }: { isLoading?: boolean }) => (
    <div data-testid="version-history" data-loading={String(Boolean(isLoading))} />
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

    expect(screen.getByRole('button', { name: 'Start setup' })).toBeDisabled();
    expect(
      screen.getByRole('progressbar', { name: 'Loading Admission Year Setup' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Selected academic year')).not.toBeInTheDocument();
    expect(screen.getByTestId('version-history')).toHaveAttribute('data-loading', 'true');
  });

  it('fails closed without rendering stale setup or version-history content', () => {
    apiMocks.standardsQuery.mockReturnValue(queryResult({ isError: true }));

    render(<AdmissionYearSetup />);

    expect(screen.getByRole('button', { name: 'Start setup' })).toBeDisabled();
    expect(screen.getByText('Admission Year Setup could not be loaded.')).toBeInTheDocument();
    expect(screen.queryByText('Selected academic year')).not.toBeInTheDocument();
    expect(screen.queryByTestId('version-history')).not.toBeInTheDocument();
  });
});
