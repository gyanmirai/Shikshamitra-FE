import { render, screen, cleanup } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import EsiStatutorySettings from './esi-statutory-settings';

const mocks = vi.hoisted(() => ({
  query: 'tab=wages',
  replace: vi.fn(),
  previewData: undefined as any,
  configure: vi.fn(),
  updateTreatments: vi.fn(),
  updateEnrollment: vi.fn(),
  createOverride: vi.fn(),
  preview: vi.fn(),
  activate: vi.fn(),
  rule: {
    id: 'rule-1',
    schemeCode: 'ESI',
    jurisdictionCode: 'IN-GJ',
    version: 1,
    effectiveFrom: '2025-11-21',
    establishmentThreshold: 10,
    standardWageCeiling: 21000,
    disabilityWageCeiling: 25000,
    employeePercentage: 0.75,
    employerPercentage: 3.25,
    exclusionCapPercentage: 50,
    inKindCapPercentage: 15,
    roundingPolicy: 'NextHigherRupee',
    sourceUrl: 'https://labour.gov.in/',
    sourceVerifiedOn: '2026-08-18',
  },
  establishment: {
    schemeCode: 'ESI',
    jurisdictionCode: 'IN-GJ',
    registrationNumber: 'GJ-ESI-1',
    employeeCount: 18,
    coveredSince: '2026-01-01',
    benefitsActiveFrom: '2026-01-01',
    status: 'Ready',
    canActivate: true,
  },
  componentTreatments: [
    {
      componentId: 'basic-1',
      componentName: 'Basic Salary',
      treatment: 'Included',
      effectiveFrom: '2026-08-01',
    },
    {
      componentId: 'allowance-1',
      componentName: 'Other Allowance',
      treatment: 'Unclassified',
      effectiveFrom: '2026-08-01',
    },
  ],
}));

vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiRuleQuery: () => ({
    data: mocks.rule,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetEsiEstablishmentQuery: () => ({
    data: mocks.establishment,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetEsiComponentTreatmentsQuery: () => ({
    data: mocks.componentTreatments,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useConfigureEsiEstablishmentMutation: () => [mocks.configure, { isLoading: false }],
  useUpdateEsiComponentTreatmentsMutation: () => [mocks.updateTreatments, { isLoading: false }],
  usePreviewEsiImpactMutation: () => [mocks.preview, { isLoading: false, data: mocks.previewData }],
  useActivateEsiMutation: () => [mocks.activate, { isLoading: false }],
  useGetEsiEnrollmentQuery: () => ({ data: undefined, isFetching: false, isError: false }),
  useUpdateEsiEnrollmentMutation: () => [mocks.updateEnrollment, { isLoading: false }],
  useGetEsiOverridesQuery: () => ({ data: [], isFetching: false, isError: false }),
  useCreateEsiOverrideMutation: () => [mocks.createOverride, { isLoading: false }],
}));

describe('ESI statutory settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = 'tab=wages';
    mocks.previewData = undefined;
  });

  afterEach(cleanup);

  it('shows statutory rule values and highlights unclassified wage components', () => {
    render(<EsiStatutorySettings />);

    expect(screen.getByText('Employee State Insurance')).toBeVisible();
    expect(screen.getByText('₹21,000')).toBeVisible();
    expect(screen.getByText('ESI Wage Mapping')).toBeVisible();
    expect(screen.getByText('1 Need Classification')).toBeVisible();
    expect(screen.getByText('Other Allowance')).toBeVisible();
  });

  it('shows employee and contribution impact before activation', () => {
    mocks.query = 'tab=review&month=2026-08';
    mocks.previewData = {
      schemeCode: 'ESI',
      monthYear: '08-2026',
      employeeCount: 1,
      coveredEmployeeCount: 1,
      employeeContributionTotal: 72,
      employerContributionTotal: 310,
      canActivate: true,
      blockingIssueCodes: [],
      employees: [
        {
          employeeId: 'employee-1',
          employeeIdentifier: '2002',
          employeeName: 'Rashilaben Patel',
          isCovered: true,
          canCalculate: true,
          coverageDecision: 'WITHIN_WAGE_CEILING',
          statutoryWages: 9538,
          wageCeiling: 21000,
          employeeContribution: 72,
          employerContribution: 310,
          enrollmentStatus: 'Covered',
          wageCeilingCategory: 'Standard',
          insuranceNumber: 'ESI-2002',
          issueCodes: [],
        },
      ],
    };

    render(<EsiStatutorySettings />);

    expect(screen.getByText('Impact Review & Activation')).toBeVisible();
    expect(screen.getByText('Rashilaben Patel')).toBeVisible();
    expect(screen.getByText('₹9,538')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Activate ESI' })).toBeEnabled();
  });
});
