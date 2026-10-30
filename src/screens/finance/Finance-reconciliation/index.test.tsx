import { vi, it, expect } from 'vitest';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

import FinanceReconciliation from './index';

const state = vi.hoisted(() => ({
  search: {},
  year: { id: 'year-2026', startDate: '2026-04-01', endDate: '2027-03-31' },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: state.year } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/hooks/use-search-param', () => ({
  useNewSearchParam: () => [state.search, vi.fn()],
}));
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    data: {
      creditCardPending: 2, creditCardApproved: 3, creditCardRejected: 1,
      upiPending: 4, upiApproved: 1, upiRejected: 2,
    },
    isLoading: false,
  }),
}));
vi.mock('src/redux/finance/reconciliation', () => ({ useGetReconciliationTabCountsQuery: vi.fn() }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => <h1>Reconciliation</h1> }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('./Component/ChequeDetailsTable', () => ({ default: () => null }));
vi.mock('./Component/DemandDraftTable', () => ({ default: () => null }));
vi.mock('./Component/BankTransferTable', () => ({ default: () => null }));
vi.mock('./Component/CreditCardTable', () => ({ default: () => null }));
vi.mock('./Component/DebitCardTable', () => ({ default: () => null }));
vi.mock('./Component/UpiTable', () => ({ default: () => null }));

it.each([
  ['Credit Card', '4/6', ['2', '3', '1', '6']],
  ['UPI', '3/7', ['4', '1', '2', '7']],
] as const)('%s exposes the same status totals on keyboard focus as its processed badge', async (label, badge, counts) => {
  render(<FinanceReconciliation />);
  const tab = screen.getByRole('tab', { name: new RegExp(label) });
  expect(within(tab).getByText(badge)).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Tab' });
  act(() => tab.focus());
  const tooltip = await screen.findByRole('tooltip');
  expect(within(tooltip).getByText(`${label} status`)).toBeInTheDocument();
  ['Pending', 'Approved', 'Rejected', 'Total'].forEach((status, index) => {
    expect(within(tooltip).getByText(status).parentElement).toHaveTextContent(`${status}${counts[index]}`);
  });
  fireEvent.keyDown(tab, { key: 'Escape' });
});
