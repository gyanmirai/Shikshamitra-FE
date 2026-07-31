import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ClassPlacementConfiguration } from './class-placement-configuration';
import { FinanceHandoffConfiguration } from './finance-handoff-configuration';
import { ActivationSettingsConfiguration } from './activation-settings-configuration';

type MockQuery = {
  data?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: ReturnType<typeof vi.fn>;
};

type AdmissionYearMock = {
  effective?: undefined;
  draft?: undefined;
  published?: undefined;
  isCreating: boolean;
  isSaving: boolean;
  savePatch: ReturnType<typeof vi.fn>;
  versionsQuery: MockQuery;
};

const mocks = vi.hoisted(() => ({
  admissionYear: {} as AdmissionYearMock,
  placementOptionsQuery: {} as MockQuery,
  configurationQuery: {} as MockQuery,
  integrationsQuery: {} as MockQuery,
}));

vi.mock('./use-admission-year-draft', () => ({
  useAdmissionYearDraft: () => mocks.admissionYear,
}));

vi.mock('../admissions-crm/enrollment-workspace-context', () => ({
  useEnrollmentWorkspace: () => ({ state: {} }),
}));

vi.mock('src/redux/student/admissions-crm/admissions-crm-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/redux/student/admissions-crm/admissions-crm-api')>();
  return {
    ...actual,
    useGetAdmissionCrmPlacementOptionsQuery: () => mocks.placementOptionsQuery,
    useGetAdmissionCrmCycleConfigurationQuery: () => mocks.configurationQuery,
    useGetAdmissionCrmIntegrationCapabilitiesQuery: () => mocks.integrationsQuery,
    useUpdateAdmissionCrmCycleConfigurationMutation: () => [vi.fn(), { isLoading: false }],
    usePreviewAdmissionCrmConfigurationImpactMutation: () => [vi.fn(), { isLoading: false }],
  };
});

const queryState = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

describe('Enrollment settings dependency errors', () => {
  beforeEach(() => {
    mocks.admissionYear = {
      effective: undefined,
      draft: undefined,
      published: undefined,
      isCreating: false,
      isSaving: false,
      savePatch: vi.fn(),
      versionsQuery: queryState({ data: [] }),
    };
    mocks.placementOptionsQuery = queryState({ data: [] });
    mocks.configurationQuery = queryState({
      data: { activationCancellationWindowDays: 7 },
    });
    mocks.integrationsQuery = queryState({ data: [] });
  });

  it('blocks Class Placement fallback editing when Admission Year rules fail', () => {
    const refetch = vi.fn();
    mocks.admissionYear.versionsQuery = queryState({ isError: true, refetch });

    render(<ClassPlacementConfiguration academicYearId="year-1" />);

    expect(screen.getByText(/placement rules could not be loaded/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('blocks Activation controls when either required read fails', () => {
    mocks.configurationQuery = queryState({ isError: true });

    render(<ActivationSettingsConfiguration academicYearId="year-1" />);

    expect(screen.getByText(/activation settings could not be loaded/i)).toBeVisible();
    expect(screen.queryByLabelText('Days after activation')).not.toBeInTheDocument();
  });

  it('distinguishes a Finance capability failure from a confirmed disconnected state', () => {
    mocks.integrationsQuery = queryState({ isError: true });

    render(<FinanceHandoffConfiguration academicYearId="year-1" />);

    expect(screen.getByText(/integration status could not be loaded/i)).toBeVisible();
    expect(screen.queryByText(/synchronization is not connected/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
  });
});
