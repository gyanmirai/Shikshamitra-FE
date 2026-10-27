import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { usePaymentTermForm } from './usePaymentTermForm';
import { getInitialPaymentTermData } from '../Components/PaymentTermInitialValues';

const { createTerm } = vi.hoisted(() => ({ createTerm: vi.fn() }));
vi.mock('src/redux/finance/paymentTerm', async () => ({
  ...(await import('../../../../../../e2e/fixtures/payment-term-impact/mock-api')),
  useCreatePaymentTermMutation: () => [createTerm, { isLoading: false, isError: false }],
}));
vi.mock(
  'src/redux/board/boardApi',
  () => import('../../../../../../e2e/fixtures/payment-term-impact/mock-api')
);
vi.mock(
  'src/redux/customQueryAndMutation',
  () => import('../../../../../../e2e/fixtures/payment-term-impact/mock-mutation')
);
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const store = configureStore({
  reducer: { globalState: (state = { currentYear: { id: 'year' } }) => state },
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('Payment term save failures', () => {
  beforeEach(() => vi.clearAllMocks());

  async function submitWithError(error: unknown, name = 'Monthly') {
    createTerm.mockReturnValue({ unwrap: () => Promise.reject(error) });
    const onClose = vi.fn();
    const hook = renderHook(() => usePaymentTermForm(null, onClose), { wrapper });
    await act(async () => {
      await hook.result.current.formik.setValues(
        getInitialPaymentTermData(
          {
            paymentTermName: name,
            boardId: 'board',
            status: 'Active',
            installments: [
              {
                installmentName: 'Annual',
                sequence: 1,
                startDate: '2026-06-01',
                endDate: '2027-05-31',
                dueDate: '2026-06-15',
                demandDate: '2026-06-01',
                allocationPercentage: 100,
                description: '',
                reminderDate: null,
                gracePeriod: null,
                allowPartialOverride: null,
                demandEnabled: true,
                reminderEnabled: false,
              },
            ],
          },
          'year'
        )
      );
    });
    await act(async () => {
      await hook.result.current.handleSubmit();
    });
    expect(createTerm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    return hook;
  }

  it('marks the name conflict inline, retains data, and clears the block after correction', async () => {
    const { result } = await submitWithError({
      status: 400,
      data: {
        errorCode: 'Finance:PaymentTerm:000023',
        detail: 'One or more business rules were violated.',
        data: { Code: 'PT-MONTHLY' },
      },
    });
    expect(result.current.formik.status.nameConflict.message).toContain('Monthly');
    expect(result.current.formik.status.nameConflict.message).toContain('in this academic year');
    expect(result.current.formik.values.installments).toHaveLength(1);
    expect(result.current.checks.nameValid).toBe(false);
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue('paymentTermName', 'Monthly revised');
    });
    expect(result.current.checks.nameValid).toBe(true);
  });

  it('shows a specific non-duplicate error once and keeps the entered values', async () => {
    const { result } = await submitWithError({
      status: 400,
      data: { detail: 'The board period changed. Refresh and review the schedule.' },
    });
    expect(shikshaMitraToast.error).toHaveBeenCalledExactlyOnceWith({
      message: 'The board period changed. Refresh and review the schedule.',
    });
    expect(result.current.formik.values.paymentTermName).toBe('Monthly');
  });

  it('retains a duplicate-name block after padding or case changes', async () => {
    const { result } = await submitWithError({
      status: 400,
      data: { errorCode: 'Finance:PaymentTerm:000042', detail: 'Name already exists.' },
    }, '9th PT One');
    await act(async () => {
      await result.current.formik.setFieldValue('paymentTermName', ' \t9TH \u00a0 PT ONE  ');
    });
    expect(result.current.checks.nameValid).toBe(false);
    expect(result.current.formik.status.nameConflict.message).toContain('9th PT One');
    expect(result.current.formik.values.paymentTermCode).toBe('PT-9TH-PT-ONE');
    await act(async () => { await result.current.handleSubmit(); });
    expect(createTerm).toHaveBeenCalledOnce();
  });

  it('trims names before sending the create request and generating the code', async () => {
    const { result } = await submitWithError({ status: 400, data: { detail: 'Try again.' } });
    createTerm.mockReturnValue({ unwrap: async () => ({}) });
    await act(async () => {
      await result.current.formik.setFieldValue('paymentTermName', '  9th PT One \t');
    });
    await act(async () => { await result.current.handleSubmit(); });
    expect(createTerm).toHaveBeenLastCalledWith(expect.objectContaining({
      name: '9th PT One', code: 'PT-9TH-PT-ONE',
    }));
  });
});
