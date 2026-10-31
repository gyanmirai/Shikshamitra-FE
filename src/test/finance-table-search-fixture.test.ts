import { it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { api } from '../../e2e/fixtures/finance-table-search/mock-service';

const fixture = api.injectEndpoints({ endpoints: (builder) => ({
  qaList: builder.query<any, { url: string; params?: Record<string, unknown>; method?: string }>({ query: (args) => args }),
}) });
const makeStore = () => configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (getDefault) => getDefault().concat(api.middleware) });
const criterion = (column: string, type: string, value: unknown) => ({ column, type, value });

it('synthetic receipts apply combined header criteria before the page slice', async () => {
  const store = makeStore();
  const result = await store.dispatch(fixture.endpoints.qaList.initiate({ url: '/v1/fee-receipts', params: {
    filters: JSON.stringify([criterion('totalPaidAmount', 'greaterThan', 6900), criterion('receiptKind', 'contains', 'Provisional')]), maxResultCount: 1, skipCount: 0,
  } })).unwrap();
  expect(result.totalCount).toBe(1);
  expect(result.items[0].receiptNumber).toBe('R-070');
  store.dispatch(api.util.resetApiState());
});
it.each(['Cheque', 'DemandDraft', 'BankTransfer', 'CreditCard', 'DebitCard', 'UPI'])('synthetic %s criteria find a row beyond the first page', async (paymentMethod) => {
  const store = makeStore();
  const result = await store.dispatch(fixture.endpoints.qaList.initiate({ url: '/v1/finance/reconciliations', params: { paymentMethod, month: 10, year: 2026, page: 1, pageSize: 1,
    filters: JSON.stringify([criterion('amount', 'between', { min: 7501, max: 7600 }), criterion('studentName', 'equals', 'Zoya Shah (2075)'), criterion('status', 'equals', 0)]),
  } })).unwrap();
  expect(result.totalCount).toBe(1);
  expect(result.items[0].receiptNumber).toBe('P-076');
  store.dispatch(api.util.resetApiState());
});
it('synthetic header alternatives OR within a column and AND across date/amount columns', async () => {
  const store = makeStore();
  const result = await store.dispatch(fixture.endpoints.qaList.initiate({ url: '/v1/fee-receipts', params: { filters: JSON.stringify([
    criterion('receiptNumber', 'equals', 'R-001'), criterion('receiptNumber', 'equals', 'R-070'), criterion('receiptDate', 'before', '2026-11-01T00:00:00Z'), criterion('totalPaidAmount', 'lessThan', 200),
  ]), maxResultCount: 20 } })).unwrap();
  expect(result.totalCount).toBe(1);
  expect(result.items[0].receiptNumber).toBe('R-001');
  store.dispatch(api.util.resetApiState());
});
it('the synthetic transport rejects writes', async () => {
  const store = makeStore();
  const result = await store.dispatch(fixture.endpoints.qaList.initiate({ url: '/v1/fee-receipts', method: 'PATCH' }));
  expect(result.error).toMatchObject({ status: 405 });
  store.dispatch(api.util.resetApiState());
});
