import { beforeEach, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useApplyAdjustment } from './useApplyAdjustment';
import type { AdjustmentRequest } from '../types/adjustment.types';

const state = vi.hoisted(() => ({ fetch: vi.fn(), apply: vi.fn() }));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useLazyGetAdjustmentApplyContextQuery: () => [
    state.fetch,
    { isLoading: false, isFetching: false },
  ],
  useApplyFeeAdjustmentMutation: () => [state.apply, { isLoading: false }],
}));
beforeEach(() => {
  state.fetch.mockReset().mockReturnValue({
    unwrap: async () => ({
      remainingAmount: 100,
      pendingFees: [
        {
          installmentId: 'due',
          dueFeeId: 'due',
          feeHeadId: 'head',
          feeHeadName: 'Tuition',
          installmentLabel: 'June 2026',
          monthOrder: 1,
          totalFees: 500,
          paidAmount: 0,
          pendingAmount: 500,
          maxApplicableAmount: 25,
        },
      ],
    }),
  });
});
const request = {
  id: 'request',
  adjustmentAmount: 100,
  remainingAdjustmentBalance: 100,
} as AdjustmentRequest;

it('respects the server-provided row limit for manual and automatic allocation', async () => {
  const { result } = renderHook(() =>
    useApplyAdjustment({ open: true, adjustment: request, approvedBy: 'Checker' })
  );
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  act(() => result.current.setSelection('due', true));
  act(() => result.current.setAppliedAmount('due', 40));
  expect(result.current.items[0].appliedAmount).toBe(25);
  act(() => result.current.autoApply());
  expect(result.current.items[0].appliedAmount).toBe(25);
  expect(result.current.summary.remainingAdjustmentBalance).toBe(75);
});
it('shows an actionable context error and permits retry after a failed read', async () => {
  state.fetch.mockReturnValueOnce({
    unwrap: async () => {
      throw new Error('Offline');
    },
  });
  const { result } = renderHook(() =>
    useApplyAdjustment({ open: true, adjustment: request, approvedBy: 'Checker' })
  );
  await waitFor(() => expect(result.current.errorText).toMatch(/could not load/i));
  act(() => result.current.retryLoad());
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  expect(result.current.errorText).toBe('');
});

it('retains incomplete decimal drafts and only permits a complete positive amount to be reviewed', async () => {
  const { result } = renderHook(() =>
    useApplyAdjustment({ open: true, adjustment: request, approvedBy: 'Checker' })
  );
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  act(() => result.current.setSelection('due', true));
  act(() => result.current.setAppliedAmount('due', '12.'));
  expect(result.current.items[0].amountDraft).toBe('12.');
  expect(result.current.hasInvalidAmounts).toBe(true);
  act(() => result.current.setAppliedAmount('due', '12.50'));
  expect(result.current.items[0].amountDraft).toBe('12.50');
  expect(result.current.hasInvalidAmounts).toBe(false);
  expect(result.current.selectedLines[0].appliedAmount).toBe(12.5);
});

it('reuses the same idempotency key after a lost response, and renews it only when the payload changes', async () => {
  const response = {
    totalAppliedAmount: 12.5,
    remainingAmount: 87.5,
    selectedInstallmentsCount: 1,
    lines: [],
  };
  state.apply
    .mockReset()
    .mockReturnValueOnce({
      unwrap: async () => {
        throw new Error('Response lost');
      },
    })
    .mockReturnValue({ unwrap: async () => response });
  const { result } = renderHook(() =>
    useApplyAdjustment({ open: true, adjustment: request, approvedBy: 'Checker' })
  );
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  act(() => result.current.setSelection('due', true));
  act(() => result.current.setAppliedAmount('due', '12.50'));
  await expect(result.current.submit()).rejects.toThrow('Response lost');
  await result.current.submit();
  expect(state.apply.mock.calls[0][0].idempotencyKey).toBe(
    state.apply.mock.calls[1][0].idempotencyKey
  );
  act(() => result.current.setAppliedAmount('due', '10'));
  await result.current.submit();
  expect(state.apply.mock.calls[2][0].idempotencyKey).not.toBe(
    state.apply.mock.calls[0][0].idempotencyKey
  );
});
