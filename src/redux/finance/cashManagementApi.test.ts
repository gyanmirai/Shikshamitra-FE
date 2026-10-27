import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { cashManagementApi } from './cashManagementApi';

const transport = vi.hoisted(() => ({ calls: [] as any[] }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any) => {
        transport.calls.push(args);
        return { data: { id: 'cash', concurrencyStamp: 'current' } };
      },
    }),
  };
});
it('scopes cash queries and posts exact approval, deposit and partial bank credit contracts', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const list = store.dispatch(
    cashManagementApi.endpoints.getCashManagement.initiate({
      academicYearId: 'year',
      page: 2,
      pageSize: 20,
      status: 0,
      search: 'receipt',
    })
  );
  await list.unwrap();
  expect(transport.calls.at(-1)).toEqual({
    url: '/finance/cash-management',
    params: { academicYearId: 'year', page: 2, pageSize: 20, status: 0, search: 'receipt' },
  });
  list.unsubscribe();
  await store
    .dispatch(
      cashManagementApi.endpoints.getCashOptions.initiate(
        { academicYearId: 'year', operation: 'expense' },
        { subscribe: false }
      )
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({
    url: '/finance/cash-management/options',
    params: { academicYearId: 'year', operation: 'expense' },
  });
  const shared = {
    academicYearId: 'year',
    concurrencyStamp: 'current',
    idempotencyKey: 'request-key',
  };
  await store
    .dispatch(
      cashManagementApi.endpoints.approveCash.initiate({
        id: 'cash',
        body: { ...shared, bankAccountId: 'bank', countedAmount: 10000 },
      })
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({
    url: '/finance/cash-management/cash/approve',
    method: 'POST',
    body: { ...shared, bankAccountId: 'bank', countedAmount: 10000 },
  });
  await store
    .dispatch(
      cashManagementApi.endpoints.depositCash.initiate({
        id: 'cash',
        body: {
          ...shared,
          amount: 6000,
          depositDate: '2026-10-20T12:00:00+05:30',
          reference: 'deposit-slip',
        },
      })
    )
    .unwrap();
  expect(transport.calls.at(-1).url).toBe('/finance/cash-management/cash/deposits');
  await store
    .dispatch(
      cashManagementApi.endpoints.confirmCashDeposit.initiate({
        id: 'cash',
        depositId: 'deposit',
        body: {
          ...shared,
          amount: 2000.25,
          creditDate: '2026-10-21T12:00:00+05:30',
          reference: 'statement-credit',
        },
      })
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({
    url: '/finance/cash-management/cash/deposits/deposit/confirm',
    method: 'POST',
    body: {
      ...shared,
      amount: 2000.25,
      creditDate: '2026-10-21T12:00:00+05:30',
      reference: 'statement-credit',
    },
  });
  store.dispatch(api.util.resetApiState());
});
