import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';

import ConcessionType from './index';

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
        return { data: { data: { items: [], totalCount: 0 } } };
      },
    }),
  };
});
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/hooks/useConfirmWithUndo', () => ({
  useConfirmWithUndo: () => ({ confirmWithUndo: vi.fn() }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('./Components/ConcessionTable', () => ({ default: () => null }));
vi.mock('./Components/ConcessionTypeForm', () => ({ default: () => null }));
vi.mock('./Components/ConcessionDocuments', () => ({ default: () => null }));
vi.mock('./Components/ConcessionTypeVersionHistoryDrawer', () => ({ default: () => null }));

function setup(initialYearId = '') {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({ permissions: [] }),
      globalState: (
        state: { currentYear: { id: string } } | undefined,
        action: { type: string; payload?: string }
      ) =>
        action.type === 'changeYear'
          ? { currentYear: { id: action.payload ?? '' } }
          : (state ?? { currentYear: { id: initialYearId } }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ConcessionType />
    </Provider>
  );
  return store;
}

beforeEach(() => {
  transport.calls = [];
});

describe('Concession Type initial academic-year loading', () => {
  it('waits for year hydration before fetching the combined list', async () => {
    const store = setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(transport.calls).toEqual([]);
    await act(async () => {
      store.dispatch({ type: 'changeYear', payload: 'year-2026' });
    });
    await waitFor(() => expect(transport.calls).toHaveLength(1));
    expect(transport.calls[0].params).toMatchObject({
      maxResultCount: 10,
      skipCount: 0,
      includeInactive: true,
    });
    expect(transport.calls[0].params.isActive).toBeUndefined();
    expect(transport.calls.some((call) => call.url.startsWith('//'))).toBe(false);
  });

  it('loads all statuses immediately with a selected year and no archive tabs', async () => {
    setup('year-2026');
    await waitFor(() => expect(transport.calls).toHaveLength(1));
    expect(transport.calls[0].params).toMatchObject({ includeInactive: true });
    expect(transport.calls[0].params.isActive).toBeUndefined();
    expect(screen.queryByRole('button', { name: 'Current' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Archived/ })).not.toBeInTheDocument();
  });
});
