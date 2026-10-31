import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';

import AccountsRegister from '.';

const state = vi.hoisted(() => ({
  params: {} as any,
  table: {} as any,
  income: false,
  error: false,
  canAdd: true,
  refetch: vi.fn(),
  url: '',
  push: vi.fn(),
  form: {} as any,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(state.url),
  useRouter: () => ({ push: state.push }),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      globalState: { currentYear: { id: 'year', startDate: '2026-04-01', endDate: '2027-03-31' } },
      auth: {
        permissions: [
          { name: `${financePermissions.accounts.income}.View`, isGranted: true },
          { name: `${financePermissions.accounts.expense}.View`, isGranted: true },
          { name: `${financePermissions.accounts.income}.Add`, isGranted: state.canAdd },
          { name: `${financePermissions.accounts.expense}.Add`, isGranted: state.canAdd },
        ],
      },
    }),
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: any) => <>{action}</>,
}));
vi.mock('./ManualEntryForm', () => ({
  default: (props: any) => {
    state.form = props;
    return (
      <div role="dialog">
        <button type="button" onClick={props.onClose}>
          Close entry
        </button>
      </div>
    );
  },
}));
vi.mock('./AccountEntryDetails', () => ({
  default: ({ row }: any) => <div>Details for {row.reference}</div>,
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ viewLabel, handleViewClick }: any) => (
    <button type="button" onClick={handleViewClick}>
      {viewLabel}
    </button>
  ),
}));
vi.mock('src/redux/finance/accountsActivityApi', () => ({
  useGetAccountsActivityQuery: (params: any) => {
    state.params = params;
    const data = {
      totalCount: 35,
      categories: [],
      items: [
        {
          id: 'refund',
          sourceId: 'request',
          studentId: 'student',
          studentName: 'Asha Patel',
          grNumber: '1001',
          classDivision: 'Class 4 - B',
          reference: 'REF-001',
          source: state.income ? 'Collection' : 'Refund',
          amount: 400,
          sourceStatus: state.income ? 'Received' : 'Paid',
        },
        {
          id: 'manual',
          sourceId: 'manual',
          studentId: null,
          studentName: 'School supplier',
          counterparty: 'School supplier',
          reference: 'Books',
          source: state.income ? 'Income' : 'Expense',
          amount: 0,
          sourceStatus: state.income ? 'Received' : 'Paid',
        },
      ],
    };
    return { data, currentData: data, isError: state.error, refetch: state.refetch };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return (
      <>
        <button type="button" onClick={() => props.onServerPagination(2, 10)}>
          Next page
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter([
              { column: 'sourceStatus', type: 'equals', value: 'Paid', valueType: 'enum' },
              {
                column: 'amount',
                type: 'between',
                value: { min: 0, max: 400 },
                valueType: 'number',
              },
              { column: 'classDivision', type: 'contains', value: 'B', valueType: 'string' },
            ])
          }
        >
          Filter rows
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerSort('studentIdentity', [{ column: 'studentIdentity', direction: 'asc' }])
          }
        >
          Sort students
        </button>
        <button type="button" onClick={() => props.onServerSearch('supplier')}>
          Search payee
        </button>
        <button type="button" onClick={() => props.onServerFilter([])}>
          Clear column filters
        </button>
        {props.errorContent}
        {props.data.map((row: any) => (
          <div
            key={row.id}
            role="row"
            tabIndex={0}
            aria-label={props.getRowAction(row)?.label}
            onClick={() => props.getRowAction(row)?.onClick()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') props.getRowAction(row)?.onClick();
            }}
          >
            {row.studentIdentity}
          </div>
        ))}
      </>
    );
  },
}));

describe('Accounts register table', () => {
  beforeEach(() => {
    state.error = false;
    state.income = false;
    state.canAdd = true;
    state.refetch.mockClear();
    state.url = '';
    state.push.mockClear();
  });

  it('opens the existing entry flow for a bank and returns to the preserved dialog', () => {
    const returnTo = '/finance/settings/bank-account-management?bankActivity=bank-1';
    state.url = new URLSearchParams({
      action: 'add',
      bankAccountId: 'bank-1',
      academicYearId: 'year',
      returnTo,
    }).toString();
    render(<AccountsRegister direction="income" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(state.form.initialBankAccountId).toBe('bank-1');
    fireEvent.click(screen.getByRole('button', { name: 'Close entry' }));
    expect(state.push).toHaveBeenCalledWith(returnTo);
  });

  it('does not open the bank entry when the selected year differs or Add is denied', () => {
    const returnTo = '/finance/settings/bank-account-management?bankActivity=bank-1';
    state.url = new URLSearchParams({
      action: 'add',
      bankAccountId: 'bank-1',
      academicYearId: 'other-year',
      returnTo,
    }).toString();
    const view = render(<AccountsRegister direction="income" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    state.url = new URLSearchParams({
      action: 'add',
      bankAccountId: 'bank-1',
      academicYearId: 'year',
      returnTo,
    }).toString();
    state.canAdd = false;
    view.rerender(<AccountsRegister direction="income" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('searches every academic month when opening a historical bank source reference', () => {
    state.url = new URLSearchParams({
      search: 'FEE-APRIL-001',
      academicYearId: 'year',
      returnTo: '/finance/settings/bank-account-management?bankActivity=bank-1',
    }).toString();
    render(<AccountsRegister direction="income" />);
    expect(state.params.search).toBe('FEE-APRIL-001');
    expect(state.params.month).toBeUndefined();
    expect(state.params.year).toBeUndefined();
  });

  it.each(['expense', 'income'] as const)(
    'uses consistent, accurate column names in %s',
    (direction) => {
      state.income = direction === 'income';
      render(<AccountsRegister direction={direction} />);
      expect(state.table.columns.map((column: any) => column.label)).toEqual([
        state.income ? 'Income Reference' : 'Expense Reference',
        'Student (GR No.)',
        'Class/Division',
        state.income ? 'Payer' : 'Payee',
        state.income ? 'Income Category' : 'Expense Category',
        'Bank Account',
        'Amount',
        'Transaction Date',
        'Status',
      ]);
      expect(
        screen.getByRole('button', { name: state.income ? 'Add Income' : 'Add Expense' })
      ).toHaveTextContent(state.income ? 'Income' : 'Expense');
      expect(state.table.data[0]).toMatchObject({
        studentIdentity: 'Asha Patel (1001)',
        classDivision: 'Class 4 - B',
        counterparty: '',
      });
      expect(state.table.data[1]).toMatchObject({
        studentIdentity: '',
        classDivision: '',
        counterparty: 'School supplier',
      });
      expect(
        state.table.columns
          .filter((column: any) => column.id !== 'actions')
          .every((column: any) => column.isFilter)
      ).toBe(true);
      expect(state.table.columns.find((column: any) => column.id === 'amount')).toMatchObject({
        filterType: 'number',
      });
      expect(state.table.columns.find((column: any) => column.id === 'amount').render(400)).toBe(
        '₹ 400'
      );
      expect(state.table.columns.find((column: any) => column.id === 'occurredAt')).toMatchObject({
        filterType: 'date',
      });
      expect(state.table.columns.at(-1)).toMatchObject({
        id: 'sourceStatus',
        stickyPosition: 'right',
        isFilter: true,
      });
      expect(state.table.columns.some((column: any) => column.id === 'actions')).toBe(false);
    }
  );

  it('filters and sorts before paging and resets the offset without losing filters', () => {
    render(<AccountsRegister direction="expense" />);
    fireEvent.click(screen.getByText('Next page'));
    expect(state.params.page).toBe(2);
    expect(state.table.page).toBe(1);
    fireEvent.click(screen.getByText('Filter rows'));
    expect(state.params.page).toBe(1);
    expect(JSON.parse(state.params.filters)).toEqual([
      { column: 'sourceStatus', type: 'equals', value: 'Paid' },
      { column: 'amount', type: 'between', value: { min: 0, max: 400 } },
      { column: 'classDivision', type: 'contains', value: 'B' },
    ]);
    fireEvent.click(screen.getByText('Sort students'));
    expect(state.params).toMatchObject({
      page: 1,
      sortBy: 'studentIdentity',
      sortDescending: false,
    });
    fireEvent.click(screen.getByText('Next page'));
    expect(state.params.filters).toBeDefined();
    expect(state.params.page).toBe(2);
    fireEvent.click(screen.getByText('Search payee'));
    expect(state.params).toMatchObject({ search: 'supplier', page: 1 });
    fireEvent.click(screen.getByText('Clear column filters'));
    expect(state.params.filters).toBeUndefined();
  });

  it('offers exact status choices without a source column and opens the selected record', () => {
    render(<AccountsRegister direction="expense" />);
    expect(
      state.table.columns
        .find((column: any) => column.id === 'sourceStatus')
        .enumOptions.map((option: any) => option.value)
    ).toEqual(['Paid', 'Returned']);
    expect(state.table.columns.some((column: any) => column.id === 'source')).toBe(false);
    expect(state.params.source).toBeUndefined();
    expect(
      screen.queryByRole('button', { name: 'View details for REF-001' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('row', { name: 'Open REF-001' }));
    expect(screen.getByText('Details for REF-001')).toBeVisible();
  });

  it('preserves read-only access and shows query errors with retry', () => {
    state.canAdd = false;
    state.error = true;
    render(<AccountsRegister direction="expense" />);
    expect(screen.queryByRole('button', { name: 'Add Expense' })).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Expenses could not be loaded.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
    expect(state.table.data).toEqual([]);
  });
});
