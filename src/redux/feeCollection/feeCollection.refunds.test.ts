import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { feeRefundApi } from 'src/redux/finance/RefundManagement/feeRefundManage';

import { feeCollectionApi } from './feeCollection';

const mocks = vi.hoisted(() => ({ request: vi.fn(), pendingRefund: 3750, nextPendingRefund: 0 }));

vi.mock('../finance/financeModuleApi', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { financeModuleType } = await import('src/redux/tagTypes');
  return {
    financeModuleApi: createApi({
      reducerPath: 'refundCollectionRegression',
      baseQuery: mocks.request,
      tagTypes: Object.values(financeModuleType),
      endpoints: () => ({}),
    }),
  };
});

describe('refund changes refresh subscribed collection balances', () => {
  beforeEach(() => {
    mocks.pendingRefund = 3750;
    mocks.nextPendingRefund = 0;
    mocks.request.mockReset();
    mocks.request.mockImplementation(async ({ method }: { method?: string }) => {
      if (method === 'POST') {
        mocks.pendingRefund = mocks.nextPendingRefund;
        return { data: {} };
      }
      return {
        data: {
          ledger: [{ items: [{ refundAmount: 15000, pendingRefundAmount: mocks.pendingRefund }] }],
          overview: { refundedAmount: 15000 },
        },
      };
    });
  });

  it.each(['create', 'approve', 'reject', 'cancel', 'fail', 'process', 'reverse'] as const)(
    'refreshes the open collect form and fee details after %s',
    async (action) => {
      const expectedPending = action === 'create' || action === 'approve' ? 3750 : 0;
      mocks.pendingRefund = expectedPending === 3750 ? 0 : 3750;
      mocks.nextPendingRefund = expectedPending;
      const store = configureStore({
        reducer: { [feeCollectionApi.reducerPath]: feeCollectionApi.reducer },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(feeCollectionApi.middleware),
      });
      const params = { studentId: 'diya', academicYearId: 'year' };
      const subscriptions = [
        store.dispatch(feeCollectionApi.endpoints.getCollectForm.initiate(params)),
        store.dispatch(feeCollectionApi.endpoints.getStudentFeeDetails.initiate(params)),
      ];
      try {
        await Promise.all(subscriptions.map((subscription) => subscription.unwrap()));
        const initialReads = mocks.request.mock.calls.length;
        const endpoints = feeRefundApi.endpoints;
        const mutations = {
          create: () =>
            store
              .dispatch(
                endpoints.createFeeRefund.initiate({
                  ...params,
                  idempotencyKey: 'create-refund',
                  originalReceiptId: 'receipt',
                  lines: [{ dueFeeId: 'december', sourceAllocationId: 'allocation', amount: 3750 }],
                  refundMethod: 'Cash',
                  reason: 'Withdrawal',
                })
              )
              .unwrap(),
          approve: () =>
            store
              .dispatch(
                endpoints.approveFeeRefund.initiate({
                  id: 'refund',
                  expenseCategoryId: 'category',
                  method: 'Cash',
                })
              )
              .unwrap(),
          reject: () =>
            store
              .dispatch(endpoints.rejectFeeRefund.initiate({ id: 'refund', notes: 'Rejected' }))
              .unwrap(),
          cancel: () =>
            store
              .dispatch(endpoints.cancelFeeRefund.initiate({ id: 'refund', notes: 'Cancelled' }))
              .unwrap(),
          fail: () =>
            store
              .dispatch(
                endpoints.failRefundPayout.initiate({
                  id: 'refund',
                  payoutId: 'attempt',
                  body: {
                    idempotencyKey: 'fail-refund',
                    evidenceReference: 'failed-attempt',
                    reason: 'Payment failed',
                  },
                })
              )
              .unwrap(),
          process: () =>
            store
              .dispatch(endpoints.processFeeRefund.initiate({ id: 'refund', body: {} }))
              .unwrap(),
          reverse: () =>
            store
              .dispatch(
                endpoints.reverseFeeRefund.initiate({
                  id: 'refund',
                  settlementId: 'settlement',
                  reason: 'Returned',
                })
              )
              .unwrap(),
        };
        await mutations[action]();

        await waitFor(() => {
          const form = feeCollectionApi.endpoints.getCollectForm.select(params)(store.getState());
          expect(form.data?.ledger[0].items[0].pendingRefundAmount).toBe(expectedPending);
          expect(form.data?.ledger[0].items[0].refundAmount).toBe(15000);
          // Both subscribed read models must refresh, not just the refund worklist.
          expect(mocks.request.mock.calls.length).toBe(initialReads + 3);
        });
      } finally {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        store.dispatch(feeCollectionApi.util.resetApiState());
      }
    }
  );
});
