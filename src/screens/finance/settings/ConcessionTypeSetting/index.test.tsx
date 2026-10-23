import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

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
  it('waits for year hydration before fetching the current list or archived count', async () => {
    const store = setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(transport.calls).toEqual([]);

    await act(async () => {
      store.dispatch({ type: 'changeYear', payload: 'year-2026' });
    });
    await waitFor(() => expect(transport.calls).toHaveLength(2));
    expect(transport.calls.every((call) => call.url === '/year-2026/concession-types')).toBe(true);
    expect(transport.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            maxResultCount: 10,
            skipCount: 0,
            includeInactive: false,
            isActive: true,
          }),
        }),
        expect.objectContaining({
          params: expect.objectContaining({
            maxResultCount: 1,
            includeInactive: true,
            isActive: false,
          }),
        }),
      ])
    );
    expect(transport.calls.some((call) => call.url.startsWith('//'))).toBe(false);
  });

  it('loads immediately with a selected year and preserves archived filters', async () => {
    setup('year-2026');
    await waitFor(() => expect(transport.calls).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: 'Archived (0)' }));
    await waitFor(() => expect(transport.calls).toHaveLength(3));
    expect(transport.calls[2]).toMatchObject({
      url: '/year-2026/concession-types',
      params: { maxResultCount: 10, skipCount: 0, includeInactive: true, isActive: false },
    });
  });
});
