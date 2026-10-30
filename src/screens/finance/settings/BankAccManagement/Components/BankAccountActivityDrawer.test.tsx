import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import BankAccountActivityDrawer from './BankAccountActivityDrawer';

import type { IBankAccount } from './type';

const fixture = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  response: {} as any,
  calls: [] as any[],
  tables: [] as any[],
  shell: {} as any,
  export: vi.fn(),
  push: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: fixture.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year', name: '2026–2027', startDate: '2026-04-01' } },
      auth: { permissions: fixture.permissions },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/hooks/useAccountSettingPermissions', () => ({
  useAccountSettingPermissions: () => ({ canView: true }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/material')>()),
  Drawer: (props: any) => {
    fixture.shell = props;
    const { open, children } = props;
    return open ? <div>{children}</div> : null;
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children, onChange }: any) => (
    <div>
      {React.Children.map(children, (child: any) => (
        <button type="button" onClick={() => onChange(null, child.props.value)}>
          {child.props.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label }: any) => <div>{label}</div>,
}));
vi.mock('src/components/custom-date-range-picker/custom-date-range-picker', () => ({
  CustomDateRangePicker: () => <div>Activity period</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    fixture.tables.push(props);
    return (
      <div>
        {props.tableTitle}
        {props.data.map((row: any) => (
          <div key={row.key}>{row.reference}</div>
        ))}
      </div>
    );
  },
}));
vi.mock('src/redux/finance/BankAccountManage/bankAccountActivityApi', () => ({
  useGetBankAccountActivityQuery: (args: any, options: any) => {
    fixture.calls.push({ args, options });
    return { ...fixture.response, refetch: fixture.refetch };
  },
  useGetBankAccountDepositsQuery: () => ({}),
  useExportBankAccountActivityMutation: () => [fixture.export, { isLoading: false }],
}));
vi.mock('src/redux/finance/BankAccountManage/bankAccountApi', () => ({
  useGetBankAccountVersionsQuery: () => ({}),
}));
vi.mock('../../components/AccountCategoryVersionDrawer', () => ({ default: () => null }));
vi.mock('./BankActivityMovementDialog', () => ({ default: () => <div>Movement details</div> }));

const bank = {
  id: 'bank',
  bankName: 'School Bank',
  maskedAccountNumber: '••1234',
  isActive: true,
  accountType: 0,
  branchName: 'Town',
  accountHolderName: 'School',
} as IBankAccount;
const page = () => ({
  account: bank,
  academicYearId: 'year',
  academicYearName: '2026–2027',
  coverage: {
    income: true,
    expense: true,
    cash: true,
    scopeLimited: true,
    message: 'Only visible activity',
  },
  capabilities: { canAddIncome: true, canAddExpense: true, canDepositCash: true },
  summary: { incoming: 1200, outgoing: 200, net: 1000, pendingIncoming: 250, inTransit: 100 },
  categories: [],
  methodBreakdown: [],
  items: [{ key: 'movement', reference: 'REF-1', canOpenSource: true }],
  totalCount: 1,
});
function show(props = {}) {
  return render(
    <BankAccountActivityDrawer
      open
      bank={bank}
      academicYearId="year"
      onClose={vi.fn()}
      {...props}
    />
  );
}
beforeEach(() => {
  fixture.permissions = [{ name: 'Finance.Accounts.IncomeTracking.View', isGranted: true }];
  fixture.calls = [];
  fixture.tables = [];
  fixture.shell = {};
  fixture.response = { currentData: page() };
  fixture.export.mockReset();
  fixture.push.mockReset();
  fixture.refetch.mockReset();
  window.history.replaceState({}, '', '/finance/settings/bank-account-management');
});
describe('credit and debit bank activity drawer', () => {
  it('preserves zero amounts and leaves unavailable money and dates unavailable', () => {
    show();
    const {columns} = fixture.tables.at(-1);
    const moneyColumn = columns.find((column: any) => column.id === 'inTransitAmount');
    expect(moneyColumn.render('-')).toBe('—');
    expect(moneyColumn.render(0)).toContain('0');
    expect(columns.find((column: any) => column.id === 'bankCreditAt').render('-')).toBe('—');
  });
  it('uses a right drawer with exactly Credit and Debit peer tabs', () => {
    show();
    expect(screen.getByRole('button', { name: 'Credit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Debit' })).toBeInTheDocument();
    ['Activity', 'Cash Deposits', 'Payment Breakdown', 'Account Details'].forEach((label) =>
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument()
    );
    expect(fixture.shell).toMatchObject({ anchor: 'right', open: true });
    expect(screen.getByRole('button', { name: 'School Bank information' })).toBeInTheDocument();
  });
  it('requests the selected direction on the server and keeps filters and pages independent', () => {
    show();
    expect(fixture.calls.at(-1).args.query).toMatchObject({
      direction: 'incoming',
      panel: 'activity',
    });
    act(() =>
      fixture.tables
        .at(-1)
        .onServerFilter([
          { column: 'reference', type: 'contains', value: 'fee', valueType: 'string' },
        ])
    );
    act(() => fixture.tables.at(-1).onServerPagination(3, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Debit' }));
    expect(fixture.calls.at(-1).args.query).toMatchObject({ direction: 'outgoing', page: 1 });
    expect(fixture.calls.at(-1).args.query.filters).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Credit' }));
    expect(fixture.calls.at(-1).args.query.page).toBe(3);
    expect(fixture.calls.at(-1).args.query.filters).toContain('fee');
  });
  it('keeps search drafts controlled and isolated while the server callback debounces', () => {
    show();
    act(() => fixture.tables.at(-1).onSearchInputChange('needle'));
    expect(fixture.tables.at(-1).searchTerm).toBe('needle');
    expect(fixture.calls.at(-1).args.query.search).toBeUndefined();
    act(() => fixture.tables.at(-1).onServerSearch('needle'));
    expect(fixture.calls.at(-1).args.query.search).toBe('needle');
    fireEvent.click(screen.getByRole('button', { name: 'Debit' }));
    expect(fixture.tables.at(-1).searchTerm).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Credit' }));
    act(() => fixture.tables.at(-1).onSearchInputChange(''));
    expect(fixture.tables.at(-1).searchTerm).toBe('');
    act(() => fixture.tables.at(-1).onServerSearch(''));
    expect(fixture.calls.at(-1).args.query.search).toBeUndefined();
  });
  it('restores readable column and enum labels after server-filter serialization', () => {
    show();
    act(() =>
      fixture.tables.at(-1).onServerFilter([
        {
          column: 'reference',
          label: 'Reference',
          type: 'contains',
          value: 'fee',
          valueType: 'string',
        },
        {
          column: 'recognitionStatus',
          label: 'Recognition',
          type: 'equals',
          value: 1,
          valueType: 'number',
        },
      ])
    );
    expect(fixture.tables.at(-1).filters[0].label).toBe('Reference');
    expect(fixture.tables.at(-1).filters[1].displayValue).toBe('Pending');
  });
  it('preserves every shared server table control and exports the selected direction', async () => {
    fixture.export.mockReturnValue({ unwrap: () => Promise.reject(new Error('test export')) });
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Debit' }));
    const table = fixture.tables.at(-1);
    expect(table).toMatchObject({
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideFilter: true,
      serverSideSort: true,
      exportScope: 'all',
      exportFormats: ['excel', 'pdf'],
    });
    expect(table.columns.find((column: any) => column.id === 'outgoing').label).toBe(
      'Debit amount'
    );
    expect(table.columns.find((column: any) => column.id === 'incoming')).toBeUndefined();
    await expect(
      table.onExport({
        format: 'pdf',
        columns: [{ id: 'outgoing', label: 'Debit amount' }],
        searchTerm: 'needle',
        filters: [],
        sorts: [{ column: 'outgoing', direction: 'asc' }],
      })
    ).rejects.toThrow('test export');
    expect(fixture.export).toHaveBeenCalledWith(
      expect.objectContaining({
        bankAccountId: 'bank',
        query: expect.objectContaining({
          direction: 'outgoing',
          panel: 'activity',
          search: 'needle',
        }),
      })
    );
  });
  it('restores debit URL state without letting a saved direction override the tab', () => {
    window.history.replaceState(
      {},
      '',
      `?bankActivityTab=debit&bankDebitQuery=${encodeURIComponent(JSON.stringify({ academicYearId: 'year', direction: 'incoming', page: 2 }))}`
    );
    show();
    expect(fixture.calls.at(-1).args.query).toMatchObject({ direction: 'outgoing', page: 2 });
  });
  it('does not expose stale account or year data', () => {
    fixture.response = { currentData: { ...page(), academicYearId: 'old' } };
    show();
    expect(screen.queryByText('REF-1')).not.toBeInTheDocument();
  });
  it('keeps error and Retry state in the shared table', () => {
    fixture.response = { isError: true, error: { status: 500 }, data: page() };
    show();
    expect(fixture.tables.at(-1).data).toEqual([]);
    expect(fixture.tables.at(-1).error).toEqual({ status: 500 });
    fixture.tables.at(-1).onRetry();
    expect(fixture.refetch).toHaveBeenCalled();
  });
  it('skips operational requests without access', () => {
    fixture.permissions = [];
    fixture.response = {};
    show();
    expect(fixture.calls.at(-1).options.skip).toBe(true);
    expect(
      screen.getByText(/requires the owning income, expense or cash viewing permission/)
    ).toBeInTheDocument();
  });
  it.each([{ open: false }, { academicYearId: '' }])('skips unsafe requests for %j', (props) => {
    show(props);
    expect(fixture.calls.at(-1).options.skip).toBe(true);
  });
  it('disables new movement actions for inactive accounts', () => {
    fixture.response = { currentData: { ...page(), account: { ...bank, isActive: false } } };
    show();
    expect(screen.getByRole('button', { name: 'Add income' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Deposit cash' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Debit' }));
    expect(screen.getByRole('button', { name: 'Add expense' })).toBeDisabled();
  });
  it('opens the existing entries with bank context', () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Add income' }));
    expect(fixture.push).toHaveBeenCalledWith(expect.stringContaining('bankAccountId=bank'));
    expect(screen.queryByRole('button', { name: 'Add expense' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Debit' }));
    expect(screen.getByRole('button', { name: 'Add expense' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deposit cash' })).not.toBeInTheDocument();
  });
  it('uses one close path for the header, footer, Escape and backdrop', () => {
    const close = vi.fn();
    show({ onClose: close });
    fireEvent.click(screen.getByRole('button', { name: 'Close School Bank' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fixture.shell.onClose({}, 'escapeKeyDown');
    fixture.shell.onClose({}, 'backdropClick');
    expect(close).toHaveBeenCalledTimes(4);
  });
});
