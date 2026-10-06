import React from 'react';
import { api } from 'src/redux/service';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { feeCollectionApi } from 'src/redux/feeCollection/feeCollection';

import ReceiptManagement from './index';

const transport = vi.hoisted(() => ({ calls: [] as any[], collected: false }));
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
        if (args.method === 'POST') {
          transport.collected = true;
          return { data: {} };
        }
        const items = [
          { id: 'january', receiptNumber: 'JAN-001', receiptDate: '2027-01-05' },
          { id: 'october', receiptNumber: 'OCT-001', receiptDate: '2026-10-05' },
          { id: 'december', receiptNumber: 'DEC-001', receiptDate: '2026-12-05' },
          ...(transport.collected
            ? [{ id: 'new', receiptNumber: 'NEW-001', receiptDate: '2026-10-05' }]
            : []),
        ].filter((item) => !args.params.month || Number(item.receiptDate.slice(5, 7)) === args.params.month);
        return { data: { items, totalCount: items.length } };
      },
    }),
  };
});
vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    isReady: true,
    filterPayload: { boardId: 'board', educationMediumId: 'medium' },
  }),
}));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({ default: () => null }));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({ default: () => null }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('./Components/ReceiptPreviewDialog', () => ({ default: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, page, onServerPagination }: any) => (
    <div>
      <span>Page {page + 1}</span>
      <button type="button" onClick={() => onServerPagination(2, 10)}>Next page</button>
      {data.map((row: any) => <span key={row.id}>{row.receiptNumber}</span>)}
    </div>
  ),
}));

function setup() {
  const initialYear = { id: 'year', startDate: '2026-06-01' };
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: (state: { currentYear: typeof initialYear } | undefined, action: any) =>
        action.type === 'changeYear'
          ? { currentYear: { ...initialYear, id: 'next-year' } }
          : (state ?? { currentYear: initialYear }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
    enhancers: (getDefault) => getDefault({ autoBatch: false }),
  });
  render(<Provider store={store}><ReceiptManagement /></Provider>);
  return store;
}

const receiptRequests = () => transport.calls.filter((call) => call.url === '/v1/fee-receipts');

beforeEach(() => {
  transport.calls = [];
  transport.collected = false;
});
afterEach(cleanup);

describe('ReceiptManagement collection visibility', () => {
  it('opens on all months even when the academic year starts in June', async () => {
    setup();
    expect(await screen.findByText('OCT-001')).toBeTruthy();
    expect(screen.getByLabelText('Month')).toHaveValue('All');
    expect(receiptRequests().at(-1).params.month).toBeUndefined();
  });

  it.each([['1', 'JAN-001'], ['12', 'DEC-001']])('sends calendar month %s and can return to all months', async (month, receipt) => {
    setup();
    await screen.findByText('OCT-001');
    fireEvent.click(screen.getByText('Next page'));
    await waitFor(() => expect(receiptRequests().at(-1).params.skipCount).toBe(20));
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: month } });
    await waitFor(() => expect(receiptRequests().at(-1).params).toMatchObject({ month: Number(month), skipCount: 0 }));
    expect(await screen.findByText(receipt)).toBeTruthy();
    expect(screen.getByText('Page 1')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: 'All' } });
    expect(await screen.findByText('OCT-001')).toBeTruthy();
  });

  it('refreshes an already loaded receipt list after fee collection', async () => {
    const store = setup();
    await screen.findByText('OCT-001');
    await act(async () => {
      await store.dispatch(feeCollectionApi.endpoints.collectFee.initiate({} as any)).unwrap();
    });
    expect(await screen.findByText('NEW-001')).toBeTruthy();
    expect(receiptRequests().length).toBeGreaterThan(1);
  });

  it('clears the month and pagination when the academic year changes', async () => {
    const store = setup();
    await screen.findByText('OCT-001');
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } });
    await screen.findByText('JAN-001');
    act(() => { store.dispatch({ type: 'changeYear' }); });
    await waitFor(() => expect(receiptRequests().at(-1).params).toMatchObject({ academicYearId: 'next-year', skipCount: 0 }));
    expect(screen.getByLabelText('Month')).toHaveValue('All');
    expect(await screen.findByText('OCT-001')).toBeTruthy();
  });
});
