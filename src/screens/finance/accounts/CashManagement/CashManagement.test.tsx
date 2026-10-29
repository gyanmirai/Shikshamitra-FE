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
  push: vi.fn(),
  depositProps: {} as any,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(state.url),
  usePathname: () => '/finance/accounts/cash-management',
  useRouter: () => {
    const [, rerender] = React.useState('');
    return {
      push: state.push,
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
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashManagementQuery: (args: any) => {
    state.query(args);
    return {
      currentData: {
        availableCash: 5329,
        yearSummary: { collected: 8429, spent: 3100, deposited: 0, remaining: 5329 },
        summary: { collected: 0, spent: 0, deposited: 0, remaining: 0 },
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
vi.mock('./CashBulkDepositDialog', () => ({
  default: (props: any) => {
    state.depositProps = props;
    const { academicYearId, amount } = props;
    return (
      <div role="dialog">
        Deposit {academicYearId}: {amount}
      </div>
    );
  },
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
  default: ({ label, value, options, onChange, valueKey = 'value', labelKey = 'label' }: any) => (
    <label htmlFor="cash-test-status">
      {label}
      <select
        id="cash-test-status"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((item: any) => (
          <option key={item[valueKey]} value={item[valueKey]}>
            {item[labelKey]}
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
      globalState: () => ({
        currentYear: {
          id: 'year',
          startDate: '2026-06-01',
          endDate: '2027-05-31',
          boards: [
            { id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] },
          ],
        },
      }),
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Deposit', isGranted: true }],
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
it('opens the year-wide deposit with the bank context after loading current cash', () => {
  state.url = new URLSearchParams({
    action: 'deposit',
    bankAccountId: 'bank-1',
    academicYearId: 'year',
    returnTo: '/finance/settings/bank-account-management?bankActivity=bank-1',
    month: '2026-10',
  }).toString();
  setup();
  expect(screen.getByRole('dialog')).toHaveTextContent('Deposit year: 5329');
  expect(state.depositProps.initialBankAccountId).toBe('bank-1');
});
it('opens a linked cash source only in the matching academic year', () => {
  state.url = 'cashId=cash&academicYearId=other-year';
  const view = setup();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.unmount();
  state.url = 'cashId=cash&academicYearId=year';
  setup();
  expect(screen.getByRole('dialog')).toHaveTextContent('Cash details cash');
});
it('shows board medium and academic month filters without statuses or row actions and opens receipt details', () => {
  setup();
  expect(screen.getByRole('heading', { name: 'Cash Management' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Medium' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Month' })).toHaveTextContent('June 2026');
  expect(state.table.columns.some((c: any) => ['status', 'actions'].includes(c.id))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'CASH-001' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('cash');
  fireEvent.click(screen.getByRole('button', { name: 'Close details' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('deposits the academic year balance independently of display filters', () => {
  state.url = 'boardId=board&mediumId=medium&month=2026-10&page=3';
  setup();
  expect(screen.getByText(/8,429/)).toBeInTheDocument();
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({
      academicYearId: 'year',
      boardId: 'board',
      mediumId: 'medium',
      month: 10,
      year: 2026,
      page: 3,
    })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Deposit year: 5329');
  state.error = true;
  React.act(() => state.table.onServerSearch('refresh failed'));
  expect(screen.getByRole('dialog')).toHaveTextContent('Deposit year: 5329');
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
it('ignores retired approval criteria in old saved links', () => {
  state.url = 'status=0';
  setup();
  React.act(() => state.table.onServerFilter([...state.table.filters, ...state.table.filters]));
  expect(state.query.mock.lastCall?.[0].status).toBeUndefined();
});
it('sends column filters and stable server sorting with a page reset', () => {
  setup();
  const filters = [
    { column: 'remainingAmount', type: 'greaterThan', value: 100, valueType: 'number' },
  ];
  React.act(() => state.table.onServerFilter([...state.table.filters, ...filters]));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({
      page: 1,
      filters: JSON.stringify(filters.map(({ valueType, ...filter }) => filter)),
    })
  );
  React.act(() => state.table.onServerSort('amount', [{ column: 'amount', direction: 'desc' }]));
  expect(state.query).toHaveBeenLastCalledWith(
    expect.objectContaining({ sortBy: 'amount', sortOrder: 'desc' })
  );
  const actions = state.table.columns.find((column: any) => column.id === 'actions');
  expect(actions).toBeUndefined();
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
