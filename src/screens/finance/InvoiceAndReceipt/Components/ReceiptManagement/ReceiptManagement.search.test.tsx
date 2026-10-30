import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import ReceiptManagement from './index';

vi.mock('@mui/material', () => ({ Box: ({ children }: any) => <div>{children}</div> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), success: vi.fn() },
}));
const transport = vi.hoisted(() => ({ calls: [] as any[], table: {} as any }));
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
        const all = Array.from({ length: 35 }, (_, i) => ({
          id: String(i),
          receiptNumber: `R-${String(i + 1).padStart(3, '0')}`,
          studentId: `student-${i}`,
          studentName: i === 34 ? 'Zoya Shah' : 'Aarav Patel',
          grNo: 1000 + i,
          rollNo: String(i + 1),
          receiptKind: 1,
          receiptKindLabel: 'Receipt (Fee)',
          receiptScope: 1,
          verificationStatus: 0,
          linkedFinalReceiptNumber: null,
          totalPaidAmount: (i + 1) * 100,
          receiptDate: '2026-10-05',
          creationTime: '2026-10-05T10:00:00Z',
          hasPdf: true,
          paymentMethodLabel: 'Cash',
          feeCollectionTransactionId: `transaction-${i}`,
        }));
        const search = String(args.params.search ?? '')
          .trim()
          .toLowerCase();
        let items = all.filter(
          (row) =>
            !search ||
            row.receiptNumber.toLowerCase().includes(search) ||
            row.studentName.toLowerCase().includes(search) ||
            String(row.grNo).includes(search)
        );
        const criteria = JSON.parse(args.params.filters ?? '[]') as Array<{ column: string; type: string; value: unknown }>;
        criteria.forEach((criterion) => {
          if (criterion.column === 'totalPaidAmount' && criterion.type === 'greaterThan') items = items.filter((row) => row.totalPaidAmount > Number(criterion.value));
        });
        const skip = args.params.skipCount ?? 0;
        return {
          data: {
            items: items.slice(skip, skip + args.params.maxResultCount),
            totalCount: items.length,
          },
        };
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
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('./Components/ReceiptPreviewDialog', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    transport.table = props;
    const { data, onServerPagination, onServerSearch, serverSidePagination, rowsPerPage } = props;
    return (
      <div>
        <input aria-label="Search receipts" onChange={(event) => onServerSearch?.(event.target.value)} />
        <button type="button" onClick={() => onServerPagination(2, 20)}>Go to next page</button>
        <button type="button" onClick={() => props.onServerFilter?.([{ column: 'totalPaidAmount', type: 'greaterThan', value: 3400, valueType: 'number' }])}>Filter paid amount</button>
        <button type="button" onClick={() => props.onServerFilter?.([])}>Clear column filters</button>
        <output aria-label="Server pagination">{String(Boolean(serverSidePagination))}</output>
        <output aria-label="Page size">{rowsPerPage}</output>
        {data.map((row: any) => <span key={row.id}>{row.receiptNumber}</span>)}
      </div>
    );
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
function show() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentYear: { id: 'year', startDate: '2026-06-01' } }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
    enhancers: (getDefault) => getDefault({ autoBatch: false }),
  });
  render(
    <Provider store={store}>
      <ReceiptManagement />
    </Provider>
  );
  return store;
}
const listRequests = () => transport.calls.filter((call) => call.url === '/v1/fee-receipts');
beforeEach(() => {
  transport.calls = [];
});
afterEach(cleanup);
describe('ReceiptManagement server table queries', () => {
  it('pages beyond the first API response without locally slicing the result again', async () => {
    show();
    await screen.findByText('R-001');
    expect(screen.getByLabelText('Server pagination')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(await screen.findByText('R-035')).toBeInTheDocument();
    expect(screen.queryByText('R-001')).not.toBeInTheDocument();
    expect(listRequests().at(-1).params).toMatchObject({ skipCount: 20, maxResultCount: 20 });
  }, 15000);
  it.each(['Zoya', 'R-035', '1034'])(
    'searches the full dataset for %s and clears back to page one',
    async (term) => {
      show();
      await screen.findByText('R-001');
      const search = screen.getByRole('textbox', { name: /Search/ });
      fireEvent.change(search, { target: { value: term } });
      expect(await screen.findByText('R-035')).toBeInTheDocument();
      expect(listRequests().at(-1).params).toMatchObject({ search: term, skipCount: 0 });
      expect(screen.queryByText('R-001')).not.toBeInTheDocument();
      fireEvent.change(search, { target: { value: '' } });
      expect(await screen.findByText('R-001')).toBeInTheDocument();
      expect(listRequests().at(-1).params.skipCount).toBe(0);
    }
  );
  it('shows a filtered empty state and recovers when search is cleared', async () => {
    show();
    await screen.findByText('R-001');
    const search = screen.getByRole('textbox', { name: /Search/ });
    fireEvent.change(search, { target: { value: 'no-matching-receipt' } });
    await waitFor(() => expect(listRequests().at(-1).params.search).toBe('no-matching-receipt'));
    await waitFor(() => expect(screen.queryByText('R-001')).not.toBeInTheDocument());
    fireEvent.change(search, { target: { value: '' } });
    expect(await screen.findByText('R-001')).toBeInTheDocument();
  });
});

it('filters the complete receipt result before paging and clears criteria without losing search or scope', async () => {
  show();
  await screen.findByText('R-001');
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  await screen.findByText('R-035');
  fireEvent.click(screen.getByRole('button', { name: 'Filter paid amount' }));
  await waitFor(() => expect(listRequests().at(-1).params).toMatchObject({
    academicYearId: 'year', boardId: 'board', educationMediumId: 'medium', skipCount: 0, maxResultCount: 20,
    filters: '[{"column":"totalPaidAmount","type":"greaterThan","value":3400}]',
  }));
  expect(await screen.findByText('R-035')).toBeInTheDocument();
  expect(screen.queryByText('R-021')).not.toBeInTheDocument();
  expect(transport.table).toMatchObject({ serverSideFilter: true, totalCount: 1 });
  expect(transport.table.filters).toHaveLength(1);
  const columns = Object.fromEntries(transport.table.columns.map((column: any) => [column.id, column]));
  expect(columns.receiptKind.filterType).toBe('string');
  expect(columns.verificationStatus.filterType).toBe('string');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '1034' } });
  await waitFor(() => expect(listRequests().at(-1).params.search).toBe('1034'));
  fireEvent.click(screen.getByRole('button', { name: 'Clear column filters' }));
  await waitFor(() => expect(listRequests().at(-1).params.filters).toBeUndefined());
  expect(listRequests().at(-1).params).toMatchObject({ search: '1034', skipCount: 0, maxResultCount: 20 });
  expect(transport.table.filters).toHaveLength(0);
});
