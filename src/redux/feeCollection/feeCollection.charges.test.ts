import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeModuleType } from 'src/redux/tagTypes';

import { feeCollectionApi, FEE_COLLECTION_V2_BASE_URL } from './feeCollection';

const mocks = vi.hoisted(() => ({ request: vi.fn(), pendingCharges: 400 }));

// Exercise the real endpoints and RTK Query subscriptions while isolating authentication/HTTP.
vi.mock('../finance/financeModuleApi', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  return {
    financeModuleApi: createApi({
      reducerPath: 'collectionRegressionApi',
      baseQuery: mocks.request,
      tagTypes: Object.values(financeModuleType),
      endpoints: () => ({}),
    }),
  };
});

describe('Collections charge balance cache', () => {
  beforeEach(() => {
    mocks.pendingCharges = 400;
    mocks.request.mockReset();
    mocks.request.mockImplementation(async ({ url, method }: any) => {
      if (method === 'POST') {
        mocks.pendingCharges = 0;
        return { data: {} };
      }
      if (url === FEE_COLLECTION_V2_BASE_URL) {
        return {
          data: {
            totalCount: 1,
            items: [{ studentId: 'diya', totalCharges: 400, pendingCharges: mocks.pendingCharges }],
          },
        };
      }
      return {
        data: { charges: [{ chargeId: 'late-1', pendingAmount: mocks.pendingCharges }] },
      };
    });
  });

  it.each(['payment', 'waiver'] as const)(
    'refreshes the subscribed grid, collection ledger and fee details after a %s',
    async (mutation) => {
      const store = configureStore({
        reducer: { [feeCollectionApi.reducerPath]: feeCollectionApi.reducer },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(feeCollectionApi.middleware),
      });
      const listParams = { academicYearId: 'year', boardId: 'board', educationMediumId: 'english' };
      const studentParams = { studentId: 'diya', academicYearId: 'year' };
      const subscriptions = [
        store.dispatch(feeCollectionApi.endpoints.getFeeCollectionList.initiate(listParams)),
        store.dispatch(feeCollectionApi.endpoints.getCollectForm.initiate(studentParams)),
        store.dispatch(feeCollectionApi.endpoints.getStudentFeeDetails.initiate(studentParams)),
      ];
      try {
        await Promise.all(subscriptions.map((subscription) => subscription.unwrap()));
        expect(
          feeCollectionApi.endpoints.getFeeCollectionList.select(listParams)(store.getState()).data
            ?.items[0]
        ).toMatchObject({ totalCharges: 400, pendingCharges: 400 });

        if (mutation === 'payment') {
          await store
            .dispatch(
              feeCollectionApi.endpoints.collectFee.initiate({
                idempotencyKey: 'payment-key',
                studentId: 'diya',
                academicYearId: 'year',
                dueFeePayments: [],
                chargePayments: [],
                lateFeePayments: [{ dueFeeId: 'due-1', amount: 400 }],
                payments: [{ paymentMethod: 'Cash', amount: 400 }],
              })
            )
            .unwrap();
        } else {
          await store
            .dispatch(
              feeCollectionApi.endpoints.applyFeeWaiver.initiate({
                idempotencyKey: 'waiver-key',
                sourceType: 'LateFee',
                sourceId: 'due-1',
                reason: 'Approved exception',
              })
            )
            .unwrap();
        }

        await waitFor(() => {
          expect(
            feeCollectionApi.endpoints.getFeeCollectionList.select(listParams)(store.getState())
              .data?.items[0]
          ).toMatchObject({ totalCharges: 400, pendingCharges: 0 });
          expect(
            feeCollectionApi.endpoints.getCollectForm.select(studentParams)(store.getState()).data
              ?.charges[0].pendingAmount
          ).toBe(0);
          expect(
            feeCollectionApi.endpoints.getStudentFeeDetails.select(studentParams)(store.getState())
              .data?.charges?.[0].pendingAmount
          ).toBe(0);
        });
        expect(
          mocks.request.mock.calls.filter(([request]) => request.method === 'GET')
        ).toHaveLength(6);
      } finally {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        store.dispatch(feeCollectionApi.util.resetApiState());
      }
    }
  );
});
