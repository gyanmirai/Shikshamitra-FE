import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  usePersistedOnboardingPolicy,
  usePersistedIdentifierSeries,
  PersistedReadinessPolicyFields,
  PersistedNumberingPolicyFields,
} from './onboarding-operational-settings';

const mocks = vi.hoisted(() => ({
  policies: [
    {
      id: 'policy-1',
      concurrencyStamp: 'policy-stamp-1',
      academicYearId: 'year-1',
      offeringId: null,
      standardId: null,
      name: 'School default',
      requireDocuments: true,
      requireFamilyDetails: true,
      requireCommunicationDetails: true,
      requireMedicalDetails: false,
      requireFeeClearance: false,
      requireStudentAccount: true,
      requireGuardianAccount: true,
      requireServiceConsent: false,
      seatReservationMinutes: 1440,
      slaHours: 72,
      isActive: true,
    },
  ],
  updatePolicy: vi.fn(),
  createPolicy: vi.fn(),
  createSeries: vi.fn(),
  deactivateSeries: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: 'year-1', name: '2026-27' } } }),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPoliciesQuery: () => ({
    data: mocks.policies,
    isFetching: false,
  }),
  useGetStudentIdentifierSeriesQuery: () => ({ data: [], isFetching: false }),
  useCreateStudentOnboardingPolicyMutation: () => [mocks.createPolicy, { isLoading: false }],
  useUpdateStudentOnboardingPolicyMutation: () => [mocks.updatePolicy, { isLoading: false }],
  useCreateStudentIdentifierSeriesMutation: () => [mocks.createSeries, { isLoading: false }],
  useDeactivateStudentIdentifierSeriesMutation: () => [
    mocks.deactivateSeries,
    { isLoading: false },
  ],
}));

beforeEach(() => {
  vi.clearAllMocks();
  [mocks.updatePolicy, mocks.createPolicy, mocks.createSeries, mocks.deactivateSeries].forEach(
    (mutation) => mutation.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  );
});

function ReadinessEditorHarness() {
  const editor = usePersistedOnboardingPolicy(true);

  return (
    <>
      <PersistedReadinessPolicyFields editor={editor} />
      <button type="button" onClick={editor.savePolicy}>
        Save defaults
      </button>
    </>
  );
}

function NumberingEditorHarness() {
  const policyEditor = usePersistedOnboardingPolicy(true);
  const seriesEditor = usePersistedIdentifierSeries(true);

  return <PersistedNumberingPolicyFields policyEditor={policyEditor} seriesEditor={seriesEditor} />;
}

it('saves the backend-supported school default policy with its concurrency stamp', async () => {
  render(<ReadinessEditorHarness />);

  fireEvent.change(screen.getByLabelText(/Completion SLA hours/), { target: { value: '96' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save defaults' }));

  await waitFor(() => expect(mocks.updatePolicy).toHaveBeenCalledTimes(1));
  expect(mocks.updatePolicy).toHaveBeenCalledWith({
    id: 'policy-1',
    policy: expect.objectContaining({
      academicYearId: 'year-1',
      concurrencyStamp: 'policy-stamp-1',
      offeringId: null,
      standardId: null,
      slaHours: 96,
    }),
  });
});

it('creates a real GR series instead of storing it in frontend session state', async () => {
  render(<NumberingEditorHarness />);

  fireEvent.change(screen.getByLabelText(/Series code/), { target: { value: 'GR-2026' } });
  fireEvent.change(screen.getByLabelText(/Series name/), { target: { value: 'GR 2026-27' } });
  fireEvent.change(screen.getByLabelText('Prefix'), { target: { value: 'GR-' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create series' }));

  await waitFor(() => expect(mocks.createSeries).toHaveBeenCalledTimes(1));
  expect(mocks.createSeries).toHaveBeenCalledWith(
    expect.objectContaining({
      academicYearId: 'year-1',
      standardId: null,
      identifierType: 0,
      code: 'GR-2026',
      name: 'GR 2026-27',
      prefix: 'GR-',
      startingSequence: 1,
    })
  );
});
