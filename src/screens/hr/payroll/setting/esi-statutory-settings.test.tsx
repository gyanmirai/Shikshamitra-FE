import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EsiStatutorySettings from './esi-statutory-settings';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  preview: vi.fn(),
  cancel: vi.fn(),
  loading: false,
  saving: false,
  attention: 0,
  error: false,
  settings: {
    current: {
      id: 'version-1',
      enabled: true,
      concurrencyStamp: 'stamp-1',
      effectiveMonth: '1900-01',
      registrationNumber: '',
      coveredSince: null as string | null,
      isCancelled: false,
    },
    history: [] as {
      id: string;
      enabled: boolean;
      concurrencyStamp: string;
      effectiveMonth: string;
      registrationNumber: string;
      coveredSince: string | null;
      isCancelled: boolean;
    }[],
    suggestedEffectiveMonth: '2026-10',
    hasSchoolWideScope: true,
  },
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('./esi-enrollment-drawer', () => ({ EsiEnrollmentDrawer: () => null }));
vi.mock('./esi-override-dialog', () => ({ default: () => null }));
vi.mock('./esi-configuration-employees', () => ({
  EsiConfigurationEmployees: ({ readiness }: { readiness: string }) => (
    <div>Staff filter: {readiness}</div>
  ),
}));
vi.mock('./esi-unsaved-navigation', () => ({
  useEsiUnsavedNavigation: () => ({
    requestNavigation: (fn: () => void) => fn(),
    confirmation: null,
  }),
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  usePreviewEsiImpactQuery: () => ({
    data: { summary: { employeesNeedingAttention: mocks.attention } },
    refetch: vi.fn(),
  }),
  useGetEsiRuleQuery: () => ({
    data: {
      employeePercentage: 0.75,
      employeeShareDailyWageExemption: 176,
      employerPercentage: 3.25,
      standardWageCeiling: 21000,
      disabilityWageCeiling: 25000,
    },
  }),
  useGetEsiComponentTreatmentsQuery: () => ({ data: [] }),
}));
vi.mock('src/redux/hr/esi-configuration-api', () => ({
  useGetEsiConfigurationQuery: () => ({
    data: mocks.loading || mocks.error ? undefined : mocks.settings,
    isLoading: mocks.loading,
    isError: mocks.error,
    refetch: vi.fn(),
  }),
  usePreviewEsiConfigurationMutation: () => [mocks.preview, { isLoading: false }],
  useSaveEsiConfigurationMutation: () => [mocks.save, { isLoading: mocks.saving }],
  useCancelEsiConfigurationMutation: () => [mocks.cancel, { isLoading: false }],
}));

const initial = {
  current: {
    id: 'version-1',
    enabled: true,
    concurrencyStamp: 'stamp-1',
    effectiveMonth: '1900-01',
    registrationNumber: '',
    coveredSince: null,
    isCancelled: false,
  },
  history: [],
  suggestedEffectiveMonth: '2026-09',
  hasSchoolWideScope: true,
};
describe('Compact ESIC settings', () => {
  beforeEach(() => {
    mocks.settings = structuredClone(initial);
    mocks.loading = false;
    mocks.saving = false;
    mocks.attention = 0;
    mocks.error = false;
    mocks.save.mockReset().mockImplementation((body) => ({
      unwrap: () =>
        Promise.resolve({ ...mocks.settings, current: { ...mocks.settings.current, ...body } }),
    }));
  });
  afterEach(cleanup);
  it('shows automatic settings with registration details available on demand', () => {
    render(<EsiStatutorySettings />);
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByLabelText('Apply from')).toBeNull();
    expect(screen.getByLabelText('ESIC registration number')).toHaveValue('');
    expect(
      screen.getByText(
        'Applies from the selected month. Locked payroll and issued payslips stay unchanged.'
      )
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /preview|schedule/i })).toBeNull();
    expect(screen.queryByText(/Employees needing attention/)).toBeNull();
    expect(screen.getByText('Enabled', { exact: true })).toBeVisible();
    expect(screen.queryByLabelText('ESIC eligibility basis')).toBeNull();
    expect(screen.queryByText('Use administrator rate override')).toBeNull();
    expect(screen.queryByText('Earning classifications')).toBeNull();
    expect(screen.queryByLabelText('Coverage start date')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Registration details' }));
    expect(screen.getByLabelText('Coverage start date')).toBeVisible();
    fireEvent.click(screen.getByRole('switch', { name: 'Calculate ESIC in ShikshaMitra' }));
    expect(screen.getByText('Unsaved changes', { exact: true })).toBeVisible();
    expect(screen.queryByLabelText('ESIC registration number')).toBeNull();
  });
  it('explains calculation through keyboard-accessible section information', async () => {
    render(<EsiStatutorySettings />);
    expect(screen.queryByText(/Eligibility uses full-month/)).toBeNull();
    await act(async () => screen.getByRole('button', { name: 'ESIC information' }).focus());
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/Eligibility uses full-month/);
  });
  it('opens the staff list with attention filtering and can collapse it', () => {
    mocks.attention = 2;
    render(<EsiStatutorySettings />);
    expect(screen.getByText('2 staff need attention before payroll.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Review Staff' }));
    expect(screen.getByText('Staff filter: needsAttention')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Hide Staff' }));
    expect(screen.queryByText('Staff filter: needsAttention')).toBeNull();
  });
  it('shows all staff when none need attention', () => {
    render(<EsiStatutorySettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Review Staff' }));
    expect(screen.getByText('Staff filter: all')).toBeVisible();
  });
  it('shows saved history on demand without changing the draft', () => {
    mocks.settings.history = [mocks.settings.current];
    render(<EsiStatutorySettings />);
    fireEvent.change(screen.getByLabelText('ESIC registration number'), {
      target: { value: 'DRAFT' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Change History' }));
    expect(screen.getByText('School default: Calculated in ShikshaMitra')).toBeVisible();
    expect(screen.getByLabelText('ESIC registration number')).toHaveValue('DRAFT');
    fireEvent.click(screen.getByRole('button', { name: 'Hide History' }));
    expect(screen.queryByText('School default: Calculated in ShikshaMitra')).toBeNull();
  });
  it('locks conflicting actions during saving', () => {
    mocks.saving = true;
    mocks.settings.history = [mocks.settings.current];
    render(<EsiStatutorySettings />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Change History' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Review Staff' })).toBeDisabled();
  });
  it('saves directly with concurrency and idempotency, without confirmation', async () => {
    render(<EsiStatutorySettings />);
    fireEvent.change(screen.getByLabelText('ESIC registration number'), {
      target: { value: 'REG-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          registrationNumber: 'REG-123',
          coveredSince: null,
          concurrencyStamp: 'stamp-1',
          idempotencyKey: expect.any(String),
        })
      )
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.save.mock.calls[0][0]).toHaveProperty(
      'effectiveMonth',
      mocks.settings.suggestedEffectiveMonth
    );
    expect(mocks.save.mock.calls[0][0]).not.toHaveProperty('previewFingerprint');
  });
  it('preserves drafts and reuses the request key after a failure', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('network')) });
    render(<EsiStatutorySettings />);
    fireEvent.change(screen.getByLabelText('ESIC registration number'), {
      target: { value: 'DRAFT' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText(/Your changes are preserved/);
    expect(screen.getByLabelText('ESIC registration number')).toHaveValue('DRAFT');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[0][0].idempotencyKey).toBe(
      mocks.save.mock.calls[1][0].idempotencyKey
    );
  });
  it('does not replace unsaved input or its concurrency token on background refresh', async () => {
    const view = render(<EsiStatutorySettings />);
    fireEvent.change(screen.getByLabelText('ESIC registration number'), {
      target: { value: 'DRAFT' },
    });
    mocks.settings = {
      ...mocks.settings,
      current: {
        ...mocks.settings.current,
        registrationNumber: 'NEW',
        concurrencyStamp: 'stamp-2',
      },
    };
    view.rerender(<EsiStatutorySettings />);
    expect(screen.getByLabelText('ESIC registration number')).toHaveValue('DRAFT');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({ concurrencyStamp: 'stamp-1' })
      )
    );
  });
  it('uses a form-shaped skeleton and never treats a failed load as enabled', () => {
    mocks.loading = true;
    const view = render(<EsiStatutorySettings />);
    expect(screen.getByLabelText('Loading ESIC settings')).toHaveAttribute('aria-busy', 'true');
    mocks.loading = false;
    mocks.error = true;
    view.rerender(<EsiStatutorySettings />);
    expect(screen.getByText('ESIC settings could not be loaded.')).toBeVisible();
    expect(screen.queryByRole('switch')).toBeNull();
  });
  it('keeps school-scoped configuration read only for restricted HR users', () => {
    mocks.settings.hasSchoolWideScope = false;
    render(<EsiStatutorySettings />);
    expect(screen.getByRole('switch', { name: 'Calculate ESIC in ShikshaMitra' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });
});
