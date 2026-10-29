import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { bankAccountActivityApi } from './bankAccountActivityApi';

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
        return { data: {} };
      },
    }),
  };
});
it('keeps account, year, period, filters and complete export query on owning endpoints', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const query = {
    academicYearId: 'year',
    from: '2026-04-01T00:00:00+05:30',
    toExclusive: '2026-10-29T00:00:00+05:30',
    page: 2,
    pageSize: 10,
    search: 'receipt',
    filters: '[{"column":"reference","type":"contains","value":"safe"}]',
    panel: 'deposits' as const,
  };
  await store
    .dispatch(
      bankAccountActivityApi.endpoints.getBankAccountActivity.initiate(
        { bankAccountId: 'bank', query },
        { subscribe: false }
      )
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({ url: '/bank-accounts/bank/activity', params: query });
  await store
    .dispatch(
      bankAccountActivityApi.endpoints.getBankAccountDeposits.initiate(
        { bankAccountId: 'bank', query },
        { subscribe: false }
      )
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({ url: '/bank-accounts/bank/deposits', params: query });
  await store
    .dispatch(
      bankAccountActivityApi.endpoints.exportBankAccountActivity.initiate({
        bankAccountId: 'bank',
        query,
        format: 'excel',
        columns: [{ id: 'incoming', label: 'Incoming' }],
      })
    )
    .unwrap();
  expect(transport.calls.at(-1)).toMatchObject({
    url: '/bank-accounts/bank/activity/export',
    method: 'POST',
    body: { query, format: 'excel', columns: [{ id: 'incoming', label: 'Incoming' }] },
  });
  expect(transport.calls.at(-1).responseHandler).toBeTypeOf('function');
  await store
    .dispatch(
      bankAccountActivityApi.endpoints.getBankAccountActivityDetail.initiate(
        { bankAccountId: 'bank', academicYearId: 'year', movementKey: 'cash:credit/1' },
        { subscribe: false }
      )
    )
    .unwrap();
  expect(transport.calls.at(-1)).toEqual({
    url: '/bank-accounts/bank/activity/cash%3Acredit%2F1',
    params: { academicYearId: 'year' },
  });
});
