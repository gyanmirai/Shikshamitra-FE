import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { ReconciliationApi } from './reconciliation';

const transport = vi.hoisted(() => ({ calls: [] as any[] }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return { api: createApi({ reducerPath: 'api', tagTypes, endpoints: () => ({}),
    baseQuery: async (args: any) => {
      transport.calls.push(args);
      const response = new Response(new Blob(['%PDF-test'], { type: 'application/pdf' }), {
        headers: { 'content-disposition': 'attachment; filename="Receipt_Fee_FIN-2026-000001_2026-10-23.pdf"' },
      });
      return { data: await args.responseHandler(response), meta: { response } };
    },
  }) };
});

it('downloads reconciliation PDFs from the receipt API and preserves its canonical filename', async () => {
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware) });
  const result = await store.dispatch(ReconciliationApi.endpoints.downloadReconciliationReceiptPdf.initiate({ receiptId: 'receipt-id' })).unwrap();
  expect(transport.calls.at(-1)).toMatchObject({ url: '/v1/fee-receipts/receipt-id/pdf', method: 'GET' });
  expect(result.fileName).toBe('Receipt_Fee_FIN-2026-000001_2026-10-23.pdf');
  expect(result.blob.size).toBe(9);
});
