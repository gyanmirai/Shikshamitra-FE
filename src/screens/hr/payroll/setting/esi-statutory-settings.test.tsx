import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EsiStatutorySettings, { isStalePreviewError } from './esi-statutory-settings';

const mocks = vi.hoisted(() => ({
  query: 'view=advanced&month=2026-08',
  replace: vi.fn(),
  push: vi.fn(),
  previewQuery: vi.fn(),
  previewRefetch: vi.fn(),
  activate: vi.fn(),
  previewData: undefined as any,
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

const successfulMutation = (result: unknown = {}) =>
  vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(result) }));

const readyPreview = () => ({
  schemeCode: 'ESI',
  monthYear: '08-2026',
  summary: {
    employeesNeedingAttention: 0,
    employeeCount: 18,
    coveredEmployeeCount: 2,
    employeeContributionTotal: 204,
    employerContributionTotal: 884,
    governmentContributionTotal: 0,
    canActivate: true,
    blockingIssues: [],
  },
  totalCount: 18,
  page: 0,
  pageSize: 25,
  items: [],
  generatedAtUtc: '2026-08-18T10:00:00Z',
  previewFingerprint: 'A'.repeat(64),
});

vi.mock('react-redux', () => ({ useSelector: () => [], useDispatch: () => vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
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
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useConfigureEsiEstablishmentMutation: () => [successfulMutation(), { isLoading: false }],
  useUpdateEsiComponentTreatmentsMutation: () => [successfulMutation(), { isLoading: false }],
  usePreviewEsiImpactQuery: (request: unknown) => {
    mocks.previewQuery(request);
    return {
      data: mocks.previewData,
      isFetching: false,
      isError: false,
      refetch: mocks.previewRefetch,
    };
  },
  useActivateEsiMutation: () => [mocks.activate, { isLoading: false }],
  useGetEsiEnrollmentQuery: () => ({ data: undefined, isFetching: false, isError: false }),
  useUpdateEsiEnrollmentMutation: () => [successfulMutation(), { isLoading: false }],
  useGetEsiOverridesQuery: () => ({ data: [], isFetching: false, isError: false }),
  useCreateEsiOverrideMutation: () => [successfulMutation(), { isLoading: false }],
}));

describe('ESI statutory settings workspace', () => {
  it('does not mislabel unrelated conflicts as stale previews', () => {
    expect(isStalePreviewError({ status: 409, data: { errorCode: 'OTHER_CONFLICT' } })).toBe(false);
    expect(isStalePreviewError({ status: 409, data: { errorCode: 'ESI_PREVIEW_STALE' } })).toBe(true);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = 'view=advanced&month=2026-08';
    mocks.previewData = undefined;
    mocks.previewRefetch.mockResolvedValue({ data: mocks.previewData });
    mocks.activate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  afterEach(cleanup);

  it('protects establishment edits when the payroll month changes', () => {
    render(<EsiStatutorySettings />);
    fireEvent.change(screen.getByRole('textbox', { name: /ESIC registration number/ }), { target: { value: 'UNSAVED' } });
    fireEvent.change(screen.getByLabelText('Payroll month'), { target: { value: '2026-07' } });
    expect(mocks.replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: /ESIC registration number/ })).toHaveValue('UNSAVED');
    expect(screen.getByLabelText('Payroll month')).toHaveValue('2026-08');
    fireEvent.change(screen.getByLabelText('Payroll month'), { target: { value: '2026-07' } });
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('month=2026-07'), { scroll: false });
  });

  it('shows only classifications needing attention by default', () => {
    render(<EsiStatutorySettings />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible();
    expect(screen.getByText('1 included, 0 excluded, 1 need review')).toBeVisible();
    expect(screen.getByText('Other Allowance')).toBeVisible();
    expect(screen.queryByText('Basic Salary')).not.toBeInTheDocument();
  });

  it('loads the monthly preview automatically with the complete server query', () => {
    mocks.query =
      'view=overview&month=2026-08&search=Patel&coverage=covered&readiness=ready&page=2&pageSize=10&sort=statutoryWages&direction=desc';

    render(<EsiStatutorySettings />);

    expect(mocks.previewQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        monthYear: '08-2026',
        search: 'Patel',
        coverage: 'covered',
        readiness: 'ready',
        page: 2,
        pageSize: 10,
        sortBy: 'statutoryWages',
        sortDirection: 'desc',
      })
    );
  });

  it('normalizes an old wage-tab deep link to the advanced workspace', async () => {
    mocks.query = 'tab=wages&month=2026-08';

    render(<EsiStatutorySettings />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        expect.stringMatching(/view=advanced.*#earning-classifications$/),
        { scroll: false }
      )
    );
  });

  it('shows exact totals in the activation confirmation', () => {
    mocks.query = 'view=overview&month=2026-08';
    mocks.previewData = readyPreview();

    render(<EsiStatutorySettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Review and activate' }));

    expect(screen.getByRole('dialog', { name: 'Review and activate ESI' })).toBeVisible();
    expect(screen.getAllByText('₹204').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹884').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Confirm activation' })).toBeEnabled();
  });

  it('does not report employee coverage or impact complete before a preview exists', () => {
    mocks.query = 'view=overview&month=2026-08';
    render(<EsiStatutorySettings />);
    expect(screen.getAllByText('Checking')).toHaveLength(2);
    expect(screen.queryByText('Employee coverage records are ready for this month.')).not.toBeInTheDocument();
    expect(screen.queryByText('This month is ready for HR review and activation.')).not.toBeInTheDocument();
  });

  it('uses the server distinct employee count instead of summing overlapping issues', () => {
    mocks.query = 'view=overview&month=2026-08';
    mocks.previewData = readyPreview();
    mocks.previewData.summary.employeesNeedingAttention = 3;
    render(<EsiStatutorySettings />);
    expect(screen.getByText('3 affected')).toBeVisible();
  });

  it('refreshes and closes the dialog when activation reports a stale preview', async () => {
    mocks.query = 'view=overview&month=2026-08';
    mocks.previewData = readyPreview();
    mocks.activate.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status: 409, data: { errorCode: 'ESI_PREVIEW_STALE' } }),
    });

    render(<EsiStatutorySettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Review and activate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm activation' }));

    await waitFor(() => expect(mocks.previewRefetch).toHaveBeenCalled());
    expect(
      screen.queryByRole('dialog', { name: 'Review and activate ESI' })
    ).not.toBeInTheDocument();
  });
});
