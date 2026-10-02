import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicationOfferStage } from '../offer/application-offer-stage';
import { ApplicationPaymentStage } from '../payment/application-payment-stage';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const mocks = vi.hoisted(() => ({ paymentActions: vi.fn(), offerActions: vi.fn(), open: vi.fn() }));
vi.mock('./admission-fee-selection-panel', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./admission-fee-selection-panel')>();
  return {
    ...actual,
    default: ({
      onEditorStateChange,
    }: {
      onEditorStateChange: (state: { dirty: boolean; busy: boolean }) => void;
    }) => (
      <div>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: false })}>
          Change fee selection
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: false, busy: true })}>
          Save fee selection
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: false, busy: false })}>
          Finish fee selection
        </button>
      </div>
    ),
  };
});
vi.mock('src/redux/student/admissions/admission-payment-api', () => ({
  useGetAdmissionPaymentStageQuery: () => ({
    data: {
      requiredAmount: 200,
      settledAmount: 200,
      outstandingAmount: 0,
      status: 'settled',
      currency: 'INR',
      concurrencyStamp: 'stamp',
      blockers: [],
      transactions: [],
      isActive: true,
      canRecord: true,
      canWaive: true,
      canComplete: true,
    },
  }),
}));
vi.mock('src/redux/student/admissions/admission-offer-api', () => ({
  useGetAdmissionOfferStageQuery: () => ({
    data: {
      status: 'accepted',
      versionNumber: 1,
      policy: { title: 'Admission offer' },
      concurrencyStamp: 'stamp',
      blockers: [],
      events: [],
      canIssue: true,
      canAccept: true,
      canComplete: true,
    },
  }),
}));
vi.mock('../payment/use-application-payment', () => ({
  useApplicationPayment: mocks.paymentActions,
}));
vi.mock('../offer/use-application-offer', () => ({ useApplicationOffer: mocks.offerActions }));
vi.mock('../payment/payment-action-dialog', () => ({ PaymentActionDialog: () => null }));
vi.mock('../offer/offer-action-dialog', () => ({ OfferActionDialog: () => null }));
vi.mock('../offer/offer-history', () => ({ OfferHistory: () => null }));
vi.mock('../payment/payment-transactions', () => ({
  PaymentTransactions: ({ active }: { active: boolean }) =>
    active ? <div>Payment transaction actions</div> : null,
}));

const stage = { id: 'stage-1' } as AdmissionApplicationStage;
const wrap = (content: React.ReactNode) =>
  render(<ThemeProvider theme={createTheme(defaultSettings)}>{content}</ThemeProvider>);

describe('managed stages protect pending fee selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.paymentActions.mockReturnValue({ open: mocks.open, action: null, busy: false });
    mocks.offerActions.mockReturnValue({ open: mocks.open, action: null, busy: false });
  });
  it('blocks payment actions, completion and automatic progression until fee selection is saved or discarded', () => {
    const onComplete = vi.fn();
    wrap(
      <ApplicationPaymentStage
        applicationId="application-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={onComplete}
      />
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Change fee selection' }));
    expect(screen.getByRole('button', { name: 'Record payment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Record waiver' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.queryByText('Payment transaction actions')).not.toBeInTheDocument();
    expect(mocks.paymentActions.mock.lastCall?.[3]).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Finish fee selection' }));
    expect(screen.getByRole('button', { name: 'Record payment' })).toBeEnabled();
    expect(mocks.paymentActions.mock.lastCall?.[3]).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
  it('blocks offer actions and progression even when a clean fee selection is still saving', () => {
    const onComplete = vi.fn();
    wrap(
      <ApplicationOfferStage
        applicationId="application-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={onComplete}
      />
    );
    expect(screen.getByRole('button', { name: 'Issue offer' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save fee selection' }));
    expect(screen.getByRole('button', { name: 'Issue offer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Record acceptance' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(mocks.offerActions.mock.lastCall?.[3]).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Finish fee selection' }));
    expect(mocks.offerActions.mock.lastCall?.[3]).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Issue offer' }));
    expect(mocks.open).toHaveBeenCalledWith('issue');
  });
});
