import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';

import FinanceChargeCategory from './ChargeCategory';

const transport = vi.hoisted(() => ({
  calls: [] as Array<{ url: string; params: Record<string, unknown> }>,
}));

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
        return { data: { items: [], totalCount: 0 } };
      },
    }),
  };
});
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const yearId = '11111111-1111-1111-1111-111111111111';
const nextYearId = '22222222-2222-2222-2222-222222222222';

function setup(initialYearId?: string) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({ permissions: [] }),
      globalState: (
        state: { currentYear: { id?: string } } | undefined,
        action: { type: string; payload?: string }
      ) =>
        action.type === 'changeYear'
          ? { currentYear: { id: action.payload } }
          : (state ?? { currentYear: { id: initialYearId } }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <FinanceChargeCategory />
    </Provider>
  );
  return store;
}

beforeEach(() => {
  transport.calls = [];
});

describe('Charge Category academic-year loading', () => {
  it.each([undefined, ''])(
    'waits for year hydration when the initial year is %s',
    async (initialYearId) => {
      const store = setup(initialYearId);
      await act(async () => {
        await Promise.resolve();
      });
      expect(transport.calls).toEqual([]);

      await act(async () => {
        store.dispatch({ type: 'changeYear', payload: yearId });
      });
      await waitFor(() => expect(transport.calls).toHaveLength(1));
      expect(transport.calls[0]).toMatchObject({
        url: '/charge-categories',
        params: { academicYearId: yearId, page: 1, pageSize: 10 },
      });
      expect(transport.calls[0].params.isActive).toBeUndefined();
    }
  );

  it('loads immediately with a selected year and pauses while that context is cleared', async () => {
    const store = setup(yearId);
    await waitFor(() => expect(transport.calls).toHaveLength(1));
    expect(transport.calls[0].params.academicYearId).toBe(yearId);

    await act(async () => {
      store.dispatch({ type: 'changeYear', payload: '' });
    });
    expect(transport.calls).toHaveLength(1);

    await act(async () => {
      store.dispatch({ type: 'changeYear', payload: nextYearId });
    });
    await waitFor(() => expect(transport.calls).toHaveLength(2));
    expect(transport.calls[1].params.academicYearId).toBe(nextYearId);
  });
});
