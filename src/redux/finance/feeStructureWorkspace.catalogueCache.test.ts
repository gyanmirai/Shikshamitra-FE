import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect } from 'vitest';
import { financePolicyType } from 'src/redux/tagTypes';
import { api } from 'src/redux/service';
import { feeStructureWorkspaceApi } from './feeStructureWorkspace';

const transport = vi.hoisted(() => ({ calls: {} as Record<string, number> }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      keepUnusedDataFor: 0,
      baseQuery: async (args: any) => {
        const year = args.params.academicYearId;
        transport.calls[year] = (transport.calls[year] ?? 0) + 1;
        return { data: { policies: [], terms: [] } };
      },
      endpoints: () => ({}),
    }),
  };
});

it('refreshes the current-year catalogue after policy changes and retains other years', async () => {
  transport.calls = {};
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const subscriptions = ['year', 'other-year'].map((academicYearId) =>
    store.dispatch(
      feeStructureWorkspaceApi.endpoints.getStructureCatalogue.initiate({
        academicYearId,
        feeStructureMetadataId: 'metadata-' + academicYearId,
        standardId: 'class-' + academicYearId,
      })
    )
  );
  try {
    await Promise.all(subscriptions.map((subscription) => subscription.unwrap()));
    expect(transport.calls.year).toBe(1);
    store.dispatch(
      api.util.invalidateTags([{ type: financePolicyType.collectionPolicy, id: 'year:year' }])
    );
    await vi.waitFor(() => expect(transport.calls.year).toBe(2));
    expect(transport.calls['other-year']).toBe(1);
    store.dispatch(
      api.util.invalidateTags([{ type: financePolicyType.refundPolicy, id: 'year:year' }])
    );
    await vi.waitFor(() => expect(transport.calls.year).toBe(3));
    expect(transport.calls['other-year']).toBe(1);
  } finally {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    store.dispatch(api.util.resetApiState());
  }
});

vi.mock('src/redux/finance/financeModuleApi', async () => {
  const { api } = await import('src/redux/service');
  return { financeModuleApi: api };
});
