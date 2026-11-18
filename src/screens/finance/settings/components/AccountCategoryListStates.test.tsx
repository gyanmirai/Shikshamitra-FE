import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IncomeCategories from '../IncomeCategories';
import ExpenseCategories from '../ExpenseCategories/ExpenseCategories';

const state = vi.hoisted(() => ({
  error: { status: 500, data: { detail: 'Category list unavailable' } } as unknown,
  fetching: false,
  currentData: undefined as { items: { id: string; name: string }[]; totalCount: number } | undefined,
  refetch: vi.fn(),
  table: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (value: unknown) => unknown) => selector({ globalState: { currentYear: { id: 'year' } }, confirmPopup: { isChanges: false } }),
}));
vi.mock('src/hooks/useAccountSettingPermissions', () => ({ useAccountSettingPermissions: () => ({ canView: true, canAdd: true, canEdit: true }) }));
vi.mock('src/hooks/use-finance-form-close', () => ({ useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }) }));
vi.mock('src/hooks/useConfirmWithUndo', () => ({ useConfirmWithUndo: () => ({ confirmWithUndo: vi.fn() }) }));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: ({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) => currentQueryAndMutation() }));
vi.mock('src/redux/finance/incomeCategory', () => ({
  useGetIncomeCategoriesQuery: () => ({ currentData: state.currentData, error: state.error, isLoading: false, isFetching: state.fetching, refetch: state.refetch }),
  useDeleteIncomeCategoryMutation: () => [vi.fn(), {}],
  usePatchIncomeCategoryStatusMutation: () => [vi.fn(), {}],
  useGetIncomeCategoryVersionsQuery: () => ({}),
}));
vi.mock('src/redux/finance/expenseCategory', () => ({
  useGetExpenseCategoryQuery: () => ({ currentData: state.currentData, error: state.error, isLoading: false, isFetching: state.fetching, refetch: state.refetch }),
  useDeleteExpenseCategoryMutation: () => [vi.fn(), {}],
  usePatchExpenseCategoryStatusMutation: () => [vi.fn(), {}],
  useGetExpenseCategoryVersionsQuery: () => ({}),
}));
vi.mock('src/screens/finance/setup/embedding/FinanceSetupManagerHeader', () => ({ FinanceSetupManagerHeader: ({ heading }: { heading: string }) => <h1>{heading}</h1> }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('../IncomeCategories/Components/IncomeCategoryForm', () => ({ default: () => null }));
vi.mock('../ExpenseCategories/Components/ExpenseCategoryForm', () => ({ default: () => null }));
vi.mock('./AccountCategoryVersionDrawer', () => ({ default: () => null }));
// Exercise both owning screens and category tables; observe their shared-table boundary.
vi.mock('src/components/customizabaleTable', () => ({ default: (props: ICustomizableTableProps) => {
  state.table(props);
  return props.error ? <button type="button" onClick={props.onRetry}>Retry</button> : <div>Category rows</div>;
} }));
beforeEach(() => { state.error = { status: 500 }; state.fetching = false; state.currentData = undefined; state.refetch.mockReset(); state.table.mockClear(); });
for (const [name, Screen] of [['income', IncomeCategories], ['expense', ExpenseCategories]] as const) {
  it('keeps the ' + name + ' heading and forwards failure/retry instead of empty data', () => {
    render(<Screen />);
    expect(screen.getByRole('heading')).toBeVisible();
    expect(state.table.mock.lastCall?.[0].error).toBe(state.error);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Category rows')).not.toBeInTheDocument();
  });
  it('refreshes ' + name + ' rows without replacing them with initial loading', () => {
    state.error = undefined; state.fetching = true; state.currentData = { items: [{ id: 'category', name: 'Category' }], totalCount: 1 };
    render(<Screen />);
    expect(state.table.mock.lastCall?.[0]).toMatchObject({ isLoading: false, isRefreshing: true, data: state.currentData.items });
  });
}
