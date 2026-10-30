import { vi, it, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { render, screen, fireEvent } from '@testing-library/react';

import UpiTable from './UpiTable';
import DebitCardTable from './DebitCardTable';
import ChequeTable from './ChequeDetailsTable';
import CreditCardTable from './CreditCardTable';
import DemandDraftTable from './DemandDraftTable';
import BankTransferTable from './BankTransferTable';

const state = vi.hoisted(() => ({
  queries: [] as any[],
  table: {} as any,
  empty: false,
  fetching: false,
  error: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] }, globalState: {} }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, params }: any) => {
    if (type !== 'query') return [vi.fn(), {}];
    state.queries.push(params);
    return {
      data: {
        items: state.empty ? [] : [{ id: 'row', studentName: 'Aarav', instrumentDetails: {} }],
        totalCount: state.empty ? 0 : 76,
      },
      isLoading: false,
      isFetching: state.fetching,
      isError: state.error,
    };
  },
}));
vi.mock('src/redux/finance/reconciliation', () => ({
  useGetReconciliationListQuery: vi.fn(),
  useDownloadReconciliationReceiptPdfMutation: vi.fn(),
}));
vi.mock('src/components/customDialog', () => ({ default: () => null, DialogScrollContent: () => null }));
vi.mock('./DemandDraftTable', async (importOriginal) => ({ ...(await importOriginal<any>()), ApproveRejectForm: () => null }));
vi.mock('./ReconciliationReceiptDialog', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { warning: vi.fn(), error: vi.fn(), success: vi.fn() },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return (
      <div>
        <input
          aria-label="Search reconciliation"
          onChange={(event) => props.onServerSearch?.(event.target.value)}
        />
        <button type="button" onClick={() => props.onServerPagination?.(2, 10)}>
          Next page
        </button>
        <button type="button" onClick={() => props.onServerFilter?.([{ column: 'amount', type: 'greaterThan', value: 500, valueType: 'number' }])}>Filter amount</button>
      </div>
    );
  },
}));
beforeEach(() => {
  state.queries = [];
  state.table = {};
  state.empty = false;
  state.fetching = false;
  state.error = false;
  vi.mocked(shikshaMitraToast.warning).mockClear();
});
it.each([
  ['CreditCard', CreditCardTable],
  ['DebitCard', DebitCardTable],
  ['UPI', UpiTable],
  ['BankTransfer', BankTransferTable],
  ['Cheque', ChequeTable],
  ['DemandDraft', DemandDraftTable],
] as const)(
  '%s sends table pagination and search to the API instead of searching a loaded page',
  (method, Component) => {
    render(
      <Component
        queryParams={{ academicYearId: 'year', month: 10, year: 2026, paymentMethod: method }}
      />
    );
    expect(state.table.serverSidePagination).toBe(true);
    expect(state.queries.at(-1)).toMatchObject({ page: 1, pageSize: 10 });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(state.queries.at(-1)).toMatchObject({ page: 2, pageSize: 10 });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Aarav' } });
    expect(state.queries.at(-1)).toMatchObject({ search: 'Aarav', page: 1, pageSize: 10 });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(state.queries.at(-1).search).toBeUndefined();
  }
);

const warningMethods = [
  ['CreditCard', CreditCardTable],
  ['DebitCard', DebitCardTable],
  ['UPI', UpiTable],
  ['BankTransfer', BankTransferTable],
  ['Cheque', ChequeTable],
  ['DemandDraft', DemandDraftTable],
] as const;
const warningScope = { academicYearId: 'year', month: 10, year: 2026, paymentMethod: 'Cheque' };
it.each(warningMethods)(
  '%s does not report the month as empty for a no-match search',
  (method, Component) => {
    render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
    state.empty = true;
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'no-match' } });
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  }
);
it.each(warningMethods)(
  '%s does not report the month as empty for a status filter',
  (method, Component) => {
    state.empty = true;
    render(
      <Component queryParams={{ ...warningScope, paymentMethod: method, status: 2 } as any} />
    );
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  }
);
it.each(warningMethods)(
  '%s waits for fetching to finish before warning about an empty month',
  (method, Component) => {
    state.empty = true;
    state.fetching = true;
    render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  }
);
it.each(warningMethods)(
  '%s does not classify a request error as an empty month',
  (method, Component) => {
    state.empty = true;
    state.error = true;
    render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  }
);
it.each(warningMethods)(
  '%s preserves the warning for a genuinely empty unfiltered month',
  (method, Component) => {
    state.empty = true;
    render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
    expect(shikshaMitraToast.warning).toHaveBeenCalled();
  }
);

it.each(warningMethods)('%s sends column filters to the server and preserves column value types', (method, Component) => {
  render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter amount' }));
  expect(state.queries.at(-1)).toMatchObject({ page: 1, pageSize: 10, filters: '[{"column":"amount","type":"greaterThan","value":500}]' });
  expect(state.table).toMatchObject({ isFilter: true, serverSideFilter: true });
  expect(state.table.columns.find((column: any) => column.id === 'amount').filterType).toBe('number');
  if (method === 'Cheque') expect(state.table.columns.find((column: any) => column.id === 'chequeNo').filterType).toBe('string');
  expect(state.table.columns.find((column: any) => column.id === 'action').isFilter).toBe(false);
});
it.each(warningMethods)('%s does not report the month as empty for a no-match column criterion', (method, Component) => {
  render(<Component queryParams={{ ...warningScope, paymentMethod: method }} />);
  state.empty = true;
  fireEvent.click(screen.getByRole('button', { name: 'Filter amount' }));
  expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
});
