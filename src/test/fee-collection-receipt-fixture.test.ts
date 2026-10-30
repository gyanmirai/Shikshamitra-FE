import type { FetchArgs } from '@reduxjs/toolkit/query';

import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect } from 'vitest';

import { api, resetFixture } from '../../e2e/fixtures/fee-collection-late-fees/mock-service';

const fixture = api.injectEndpoints({
  endpoints: (builder) => ({
    receiptRequest: builder.mutation<any, FetchArgs>({ query: (args) => args }),
  }),
});

it('keeps synthetic paid late fees independent from ordinary paid charges', async () => {
  vi.stubGlobal('window', { location: { search: '' } });
  resetFixture();
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  try {
    const form = await store
      .dispatch(fixture.endpoints.receiptRequest.initiate({ url: '/fee-collections/collect-form' }))
      .unwrap();
    const lateFee = form.charges.find((charge: any) => charge.sourceType === 'LateFee');
    const result = await store
      .dispatch(
        fixture.endpoints.receiptRequest.initiate({
          url: '/fee-collections',
          method: 'POST',
          body: {
            idempotencyKey: 'late-only',
            studentId: 'diya-10092',
            academicYearId: 'year-2026',
            dueFeePayments: [],
            chargePayments: [],
            lateFeePayments: [{ dueFeeId: lateFee.sourceId, amount: lateFee.pendingAmount }],
            payments: [{ paymentMethod: 0, amount: lateFee.pendingAmount }],
          },
        })
      )
      .unwrap();
    expect(result.paidCharges).toEqual([]);
    expect(result.paidLateFees).toHaveLength(1);
    expect(result.feeReceiptId).toBeUndefined();
    expect(result.chargeReceiptId).toBeTruthy();
  } finally {
    store.dispatch(api.util.resetApiState());
    vi.unstubAllGlobals();
  }
});

it.each(['receipt-separate', 'receipt-combined'] as const)(
  'issues the requested receipt evidence for %s without changing payment allocations',
  async (scenario) => {
    vi.stubGlobal('window', { location: { search: '' } });
    resetFixture(scenario);
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
    });
    try {
      const request = (args: FetchArgs) =>
        store.dispatch(fixture.endpoints.receiptRequest.initiate(args)).unwrap();
      const form = await request({ url: '/fee-collections/collect-form' });
      expect(form.receiptGrouping).toBe(scenario === 'receipt-combined' ? 'Combined' : 'Separate');
      const principal = form.ledger[0].items[0];
      const lateFee = form.charges[0];
      const result = await request({
        url: '/fee-collections',
        method: 'POST',
        body: {
          idempotencyKey: scenario,
          studentId: 'diya-10092',
          academicYearId: 'year-2026',
          dueFeePayments: [
            { dueFeeId: principal.dueFeeId, feeHeadId: principal.feeHeadId, amount: 20000 },
          ],
          chargePayments: [],
          lateFeePayments: [{ dueFeeId: lateFee.sourceId, amount: 60600 }],
          payments: [{ paymentMethod: 0, amount: 80600 }],
        },
      });
      expect(result.receivedAmount).toBe(80600);
      expect(result.paidDueFees[0].amountPaid).toBe(20000);
      expect(result.paidLateFees[0].amountPaid).toBe(60600);
      expect(result.paidCharges).toEqual([]);
      expect(result.feeReceiptId).toBeTruthy();
      expect(result.feeReceiptAmount).toBe(scenario === 'receipt-combined' ? 80600 : 20000);
      expect(result.chargeReceiptAmount).toBe(scenario === 'receipt-combined' ? undefined : 60600);
      const feePdf = await request({ url: `/v1/fee-receipts/${result.feeReceiptId}/pdf` });
      expect(await feePdf.text()).toContain(
        `INR ${scenario === 'receipt-combined' ? 80600 : 20000}`
      );
      if (scenario === 'receipt-combined') {
        expect(result.chargeReceiptId).toBeUndefined();
      } else {
        expect(result.chargeReceiptId).toBeTruthy();
        const chargePdf = await request({ url: `/v1/fee-receipts/${result.chargeReceiptId}/pdf` });
        expect(await chargePdf.text()).toContain('INR 60600');
      }
    } finally {
      store.dispatch(api.util.resetApiState());
      vi.unstubAllGlobals();
    }
  }
);
