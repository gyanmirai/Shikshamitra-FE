import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { usePaymentTermForm } from './usePaymentTermForm';

vi.mock(
  'src/redux/finance/paymentTerm',
  () => import('../../../../../../e2e/fixtures/payment-term-impact/mock-api')
);
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
const editData = {
  id: 'monthly',
  boardId: 'board',
  academicYearId: 'year',
  isUsedInDownstream: true,
  canDirectEdit: false,
} as any;

describe('Payment term default replacement', () => {
  beforeEach(() => {
    (window as any).paymentTermWrites = [];
  });

  it('previews replacement, cancels without writes, then saves only after confirmation', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => usePaymentTermForm(editData, onClose), { wrapper });
    await waitFor(() => expect(result.current.formik.values.paymentTermName).toBe('monthly'));
    await act(async () => {
      await result.current.formik.setFieldValue('isDefaultTerm', true);
    });
    expect(result.current.defaultImpact?.currentDefaultName).toBe('Half-Yearly');
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.confirmationImpact?.currentDefaultVersionNumber).toBe(2);
    expect((window as any).paymentTermWrites).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
    act(() => result.current.cancelDefaultConfirmation());
    expect(result.current.confirmationImpact).toBeNull();
    expect((window as any).paymentTermWrites).toHaveLength(0);
    await act(async () => {
      await result.current.handleSubmit();
    });
    await act(async () => {
      await result.current.handleSubmit(true);
    });
    expect((window as any).paymentTermWrites).toHaveLength(2);
    expect((window as any).paymentTermWrites[1].body.isDefault).toBe(true);
    expect(onClose).toHaveBeenCalledWith(null, true);
  });

  it('trims the name in an edit revision without changing the existing code', async () => {
    const { result } = renderHook(() => usePaymentTermForm(editData, vi.fn()), { wrapper });
    await waitFor(() => expect(result.current.formik.values.paymentTermName).toBe('monthly'));
    const code = result.current.formik.values.paymentTermCode;
    await act(async () => {
      await result.current.formik.setFieldValue('paymentTermName', '  monthly revised \t');
    });
    await act(async () => { await result.current.handleSubmit(); });
    expect((window as any).paymentTermWrites).toHaveLength(2);
    expect((window as any).paymentTermWrites[1].body).toMatchObject({
      name: 'monthly revised', code,
    });
  });
});
