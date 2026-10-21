import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { EarningEsiTreatmentDialog } from './earning-esi-treatment-dialog';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  close: vi.fn(),
  refetch: vi.fn(),
  allowed: true,
  scope: true,
  treatmentError: false,
  stamp: 'reviewed',
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => mocks.allowed }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/hr/esi-configuration-api', () => ({
  useGetEsiConfigurationQuery: () => ({
    data: {
      hasSchoolWideScope: mocks.scope,
      suggestedEffectiveMonth: '2026-11',
      current: {
        id: 'current',
        effectiveMonth: '2026-10',
        concurrencyStamp: mocks.stamp,
        enabled: true,
        registrationNumber: 'REG',
        coveredSince: '2025-04-01',
        isCancelled: false,
      },
      history: [
        {
          id: 'scheduled',
          effectiveMonth: '2026-12',
          concurrencyStamp: 'december',
          enabled: false,
          registrationNumber: 'DEC-REG',
          coveredSince: null,
          isCancelled: false,
        },
      ],
    },
  }),
  useSaveEsiConfigurationMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiComponentTreatmentsQuery: () => ({
    currentData: [
      { componentId: 'earning-1', componentName: 'Allowance', treatment: 'Unclassified' },
    ],
    isFetching: false,
    isError: mocks.treatmentError,
    refetch: mocks.refetch,
  }),
}));
const props = { component: { id: 'earning-1', name: 'Allowance' }, onClose: mocks.close };
function changeTreatment() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ESIC wage treatment' }));
  fireEvent.click(screen.getByRole('option', { name: 'Included in ESIC wages' }));
}
describe('ESIC treatment at the earning component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.allowed = true;
    mocks.scope = true;
    mocks.treatmentError = false;
    mocks.stamp = 'reviewed';
    mocks.save.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });
  afterEach(cleanup);
  it('saves only the selected classification and preserves school registration and mode', async () => {
    render(<EarningEsiTreatmentDialog {...props} />);
    expect(screen.getByRole('button', { name: 'Save treatment' })).toBeDisabled();
    changeTreatment();
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          effectiveMonth: '2026-11',
          concurrencyStamp: 'reviewed',
          enabled: true,
          registrationNumber: 'REG',
          coveredSince: '2025-04-01',
          treatments: [{ componentId: 'earning-1', treatment: 'Included' }],
          calculationSettings: {
            eligibilityBasis: 'CLASSIFIED_EARNINGS',
            calculationBasis: 'CLASSIFIED_EARNINGS',
          },
          idempotencyKey: expect.any(String),
        })
      )
    );
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it('lets HR review earnings that are not rows in the master component list', async () => {
    render(<EarningEsiTreatmentDialog onClose={mocks.close} />);
    fireEvent.mouseDown(screen.getByLabelText('Earning'));
    fireEvent.click(screen.getByRole('option', { name: 'Allowance · Needs review' }));
    changeTreatment();
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          treatments: [{ componentId: 'earning-1', treatment: 'Included' }],
        })
      )
    );
  });
  it('preserves scheduled school settings when classifying for a future month', async () => {
    render(<EarningEsiTreatmentDialog {...props} />);
    fireEvent.change(screen.getByLabelText('Changes effective from'), {
      target: { value: '2026-12' },
    });
    changeTreatment();
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          effectiveMonth: '2026-12',
          concurrencyStamp: 'december',
          enabled: false,
          registrationNumber: 'DEC-REG',
        })
      )
    );
  });
  it('retains the reviewed concurrency token on background refresh', async () => {
    const view = render(<EarningEsiTreatmentDialog {...props} />);
    changeTreatment();
    mocks.stamp = 'new-version';
    view.rerender(<EarningEsiTreatmentDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({ concurrencyStamp: 'reviewed' })
      )
    );
  });
  it('preserves a failed draft and reuses the same idempotency key for retry', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('network')) });
    render(<EarningEsiTreatmentDialog {...props} />);
    changeTreatment();
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await screen.findByText(/Your changes are preserved/);
    fireEvent.click(screen.getByRole('button', { name: 'Save treatment' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[0][0].idempotencyKey).toBe(
      mocks.save.mock.calls[1][0].idempotencyKey
    );
    expect(mocks.close).not.toHaveBeenCalled();
  });
  it.each(['permission', 'scope'])('keeps classification read only without %s', (missing) => {
    if (missing === 'permission') mocks.allowed = false;
    else mocks.scope = false;
    render(<EarningEsiTreatmentDialog {...props} />);
    expect(screen.queryByRole('button', { name: 'Save treatment' })).toBeNull();
    expect(screen.getByRole('combobox', { name: 'ESIC wage treatment' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
  it('does not save while the treatment lookup has failed', () => {
    mocks.treatmentError = true;
    render(<EarningEsiTreatmentDialog {...props} />);
    expect(screen.getByRole('button', { name: 'Save treatment' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
