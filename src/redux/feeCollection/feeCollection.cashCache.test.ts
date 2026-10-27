import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { cashManagementApi } from 'src/redux/finance/cashManagementApi';

import { feeCollectionApi } from './feeCollection';

const transport = vi.hoisted(() => ({ collected: false, cashReads: 0, optionReads: 0 }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async ({ url, method }: any) => {
        if (method === 'POST') {
          transport.collected = true;
          return { data: { receiptId: 'receipt' } };
        }
        if (url === '/finance/cash-management') {
          transport.cashReads += 1;
          return { data: { items: [], totalCount: transport.collected ? 1 : 0 } };
        }
        if (url.endsWith('/options')) {
          transport.optionReads += 1;
          return { data: { bankAccounts: [], cashSources: [] } };
        }
        return { data: {} };
      },
    }),
  };
});
it('refreshes mounted cash rows and action options after ordinary fee collection succeeds', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const args = { academicYearId: 'year', page: 1, pageSize: 20 };
  const list = store.dispatch(cashManagementApi.endpoints.getCashManagement.initiate(args));
  const options = store.dispatch(
    cashManagementApi.endpoints.getCashOptions.initiate({
      academicYearId: 'year',
      operation: 'approve',
    })
  );
  await Promise.all([list.unwrap(), options.unwrap()]);
  await store
    .dispatch(
      feeCollectionApi.endpoints.collectFee.initiate({
        studentId: 'student',
        academicYearId: 'year',
        payments: [{ paymentMethod: 0, amount: 100 }],
      } as any)
    )
    .unwrap();
  await waitFor(() =>
    expect(
      cashManagementApi.endpoints.getCashManagement.select(args)(store.getState()).data?.totalCount
    ).toBe(1)
  );
  expect(transport.cashReads).toBe(2);
  expect(transport.optionReads).toBe(2);
  list.unsubscribe();
  options.unsubscribe();
  store.dispatch(api.util.resetApiState());
});
