import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect } from 'vitest';

import { feeCollectionApi } from './feeCollection';

const transport = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../finance/financeModuleApi', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  return {
    financeModuleApi: createApi({
      reducerPath: 'receiptContractApi',
      baseQuery: transport.request,
      endpoints: () => ({}),
    }),
  };
});

it.each(['fee', 'charge'] as const)(
  'downloads a %s receipt from the unified backend receipt endpoint',
  async (receiptType) => {
    const pdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    transport.request.mockResolvedValue({ data: pdf });
    const store = configureStore({
      reducer: { [feeCollectionApi.reducerPath]: feeCollectionApi.reducer },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat(feeCollectionApi.middleware),
    });
    try {
      const result = await store
        .dispatch(
          feeCollectionApi.endpoints.downloadReceiptPdf.initiate({
            receiptId: 'receipt-id',
            receiptType,
          })
        )
        .unwrap();
      expect(transport.request).toHaveBeenLastCalledWith(
        expect.objectContaining({ url: '/v1/fee-receipts/receipt-id/pdf', method: 'GET' }),
        expect.anything(),
        undefined
      );
      expect(result).toBe(pdf);
    } finally {
      store.dispatch(feeCollectionApi.util.resetApiState());
    }
  }
);
