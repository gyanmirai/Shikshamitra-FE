import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CashManagement from './index';

const state = vi.hoisted(() => ({
  canView: true,
  error: false,
  fetching: false,
  query: vi.fn(),
  retry: vi.fn(),
  table: {} as any,
  url: '',
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(state.url),
  usePathname: () => '/finance/accounts/cash-management',
  useRouter: () => {
    const [, rerender] = React.useState('');
    return {
      replace: (url: string) => {
        state.url = url.split('?')[1] || '';
        rerender(url);
      },
    };
  },
}));
vi.mock('src/screens/finance/hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ isReady: true, canView: state.canView }),
}));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashManagementQuery: (args: any) => {
    state.query(args);
    return {
      currentData: {
        items: [{ id: 'cash', reference: 'CASH-001', status: 0, canApprove: true }],
        totalCount: 1,
        statusCounts: { all: 1, pending: 1, approved: 0 },
      },
      isError: state.error,
      isFetching: state.fetching,
      error: state.error ? 'failed' : undefined,
      refetch: state.retry,
    };
  },
}));
vi.mock('./CashApprovalDialog', () => ({
  default: ({ id }: any) => <div role="dialog">Approve {id}</div>,
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button key={action.id} type="button" disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('./CashDetails', () => ({
  default: ({ id, onClose }: any) => (
    <div role="dialog">
      Cash details {id}
      <button type="button" onClick={onClose}>
        Close details
      </button>
    </div>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <label htmlFor="cash-test-status">
      {label}
      <select
        id="cash-test-status"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  // Shared CustomizableTable gives supplied errorContent precedence independently of error.
  default: (props: any) => {
    state.table = props;
    const { data, getRowAction, errorContent, isLoading, columns } = props;
    return (
      <div>
        {isLoading && <span>Loading cash</span>}
        {errorContent ||
          data.map((row: any) => (
            <button type="button" key={row.id} onClick={getRowAction(row).onClick}>
              {row.reference}
            </button>
          ))}
        {!errorContent &&
          data.map((row: any) => (
            <React.Fragment key={row.id}>
              {columns.find((c: any) => c.id === 'actions')?.render(null, row)}
            </React.Fragment>
          ))}
      </div>
    );
  },
}));
function setup() {
  const store = configureStore({
    reducer: {
      globalState: () => ({ currentYear: { id: 'year' } }),
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Approve', isGranted: true }],
      }),
    },
  });
  return render(
    <Provider store={store}>
      <CashManagement />
    </Provider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  state.canView = true;
  state.error = false;
  state.fetching = false;
  state.url = '';
});
it('queries the selected pending or approved state and opens the selected receipt details', () => {
  setup();
  expect(screen.getByRole('heading', { name: 'Cash Management' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Pending approval/ }));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({ academicYearId: 'year', status: 0, page: 1 })
  );
  fireEvent.click(screen.getByRole('button', { name: /^Approved/ }));
  expect(state.query).toHaveBeenLastCalledWith(expect.objectContaining({ status: 1 }));
  fireEvent.click(screen.getByRole('button', { name: 'CASH-001' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('cash');
  fireEvent.click(screen.getByRole('button', { name: 'Close details' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('opens approval directly from Actions without opening the details drawer', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Approve CASH-001' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Approve cash');
  expect(screen.queryByText('Cash details cash')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
});
it('preserves a linked page when the table hydrates the same search term', () => {
  state.url = 'page=3&search=receipt';
  setup();
  React.act(() => state.table.onServerSearch('receipt'));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({ page: 3, search: 'receipt' })
  );
});
it('keeps pending selected when the same status is applied from the column filter', () => {
  state.url = 'status=0';
  setup();
  React.act(() => state.table.onServerFilter([...state.table.filters, ...state.table.filters]));
  expect(state.query).toHaveBeenLastCalledWith(expect.objectContaining({ status: 0 }));
});
it('sends column filters and stable server sorting with a page reset', () => {
  setup();
  const filters = [
    { column: 'remainingAmount', type: 'greaterThan', value: 100, valueType: 'number' },
  ];
  fireEvent.click(screen.getByRole('button', { name: /Pending approval/ }));
  React.act(() => state.table.onServerFilter([...state.table.filters, ...filters]));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({
      page: 1,
      status: 0,
      filters: JSON.stringify(filters.map(({ valueType, ...filter }) => filter)),
    })
  );
  React.act(() => state.table.onServerSort('amount', [{ column: 'amount', direction: 'desc' }]));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({ sortBy: 'amount', sortOrder: 'desc', status: 0 })
  );
  const actions = state.table.columns.find((column: any) => column.id === 'actions');
  expect(actions).toMatchObject({
    sticky: true,
    stickyPosition: 'right',
    isFilter: false,
    isSort: false,
  });
});
it('does not mount a cash query without View and offers Retry for a failed list', () => {
  state.canView = false;
  const view = setup();
  expect(state.query).not.toHaveBeenCalled();
  expect(screen.getByText(/do not have permission/)).toBeInTheDocument();
  view.unmount();
  state.canView = true;
  state.error = true;
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.retry).toHaveBeenCalledOnce();
});
