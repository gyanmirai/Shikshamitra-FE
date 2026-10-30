import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FinanceReconciliation from './index';

const state = vi.hoisted(() => ({ params: {} as any }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year', startDate: '2026-04-01', endDate: '2027-03-31' } },
    }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/hooks/use-search-param', () => ({ useNewSearchParam: () => [{}, vi.fn()] }));
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ data: {}, isLoading: false }),
}));
vi.mock('src/redux/finance/reconciliation', () => ({
  useGetReconciliationTabCountsQuery: vi.fn(),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('./Component/ChequeDetailsTable', () => ({
  default: ({ queryParams }: any) => {
    state.params = queryParams;
    return null;
  },
}));
vi.mock('./Component/DemandDraftTable', () => ({ default: () => null }));
vi.mock('./Component/BankTransferTable', () => ({ default: () => null }));
vi.mock('./Component/CreditCardTable', () => ({ default: () => null }));
vi.mock('./Component/DebitCardTable', () => ({ default: () => null }));
vi.mock('./Component/UpiTable', () => ({ default: () => null }));
it('filters verification status on the API while retaining the chosen month', () => {
  render(<FinanceReconciliation />);
  fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });
  fireEvent.change(screen.getByLabelText('Verification status'), { target: { value: '2' } });
  expect(state.params).toMatchObject({ month: 10, year: 2026, status: 2 });
  fireEvent.change(screen.getByLabelText('Verification status'), { target: { value: 'All' } });
  expect(state.params.status).toBeUndefined();
  expect(state.params.month).toBe(10);
}, 15000);
