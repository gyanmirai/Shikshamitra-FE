import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EsiStatutorySettings from './esi-statutory-settings';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  preview: vi.fn(),
  cancel: vi.fn(),
  loading: false,
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
    history: [],
    suggestedEffectiveMonth: '2026-10',
    hasSchoolWideScope: true,
  },
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('../../employee/employee-form-fields/InformationFields', () => ({
  SectionCard: ({ title, children, headerContent }: any) => (
    <section>
      <h2>{title}</h2>
      {headerContent}
      {children}
    </section>
  ),
}));
vi.mock('./esi-enrollment-drawer', () => ({ EsiEnrollmentDrawer: () => null }));
vi.mock('./esi-override-dialog', () => ({ default: () => null }));
vi.mock('./esi-configuration-employees', () => ({ EsiConfigurationEmployees: () => null }));
vi.mock('./esi-unsaved-navigation', () => ({
  useEsiUnsavedNavigation: () => ({
    requestNavigation: (fn: () => void) => fn(),
    confirmation: null,
  }),
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  usePreviewEsiImpactQuery: () => ({
    data: { summary: { employeesNeedingAttention: 0 } },
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
  useSaveEsiConfigurationMutation: () => [mocks.save, { isLoading: false }],
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
    mocks.error = false;
    mocks.save.mockReset().mockImplementation((body) => ({
      unwrap: () =>
        Promise.resolve({ ...mocks.settings, current: { ...mocks.settings.current, ...body } }),
    }));
  });
  afterEach(cleanup);
  it('shows one form with optional registration and no preview or scheduling', () => {
    render(<EsiStatutorySettings />);
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByLabelText('Apply from')).toBeNull();
    expect(screen.getByLabelText('ESIC registration number')).toHaveValue('');
    expect(screen.getByText('Applies to current and future unlocked payroll.')).toBeVisible();
    expect(screen.queryByRole('button', { name: /preview|schedule/i })).toBeNull();
    expect(screen.queryByText(/Employees needing attention/)).toBeNull();
    expect(screen.getByText('Active', { exact: true })).toBeVisible();
    fireEvent.click(screen.getByRole('switch', { name: 'Enable ESIC for payroll' }));
    expect(screen.getByText('Inactive', { exact: true })).toBeVisible();
    expect(screen.queryByLabelText('ESIC registration number')).toBeNull();
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
    expect(screen.getByRole('switch', { name: 'Enable ESIC for payroll' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });
});
