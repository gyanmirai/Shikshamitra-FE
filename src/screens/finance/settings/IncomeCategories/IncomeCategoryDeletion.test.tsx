import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { CustomBreadcrumbsProps } from 'src/components/custom-breadcrumbs/types';
import type { AdaptiveThreeDotsActionsProps } from 'src/components/adaptive-three-dots-actions/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import FinanceIncomeCategoriesScreen from './index';
import FinanceExpenseCategoriesScreen from '../ExpenseCategories/ExpenseCategories';

const mocks = vi.hoisted(() => ({
  academicYearId: 'year' as string | undefined,
  canDelete: true,
  isActive: false,
  isUsed: false,
  isSystem: false,
  deletionReason: undefined as string | null | undefined,
  deleting: false,
  addCategory: vi.fn(),
  deleteCategory: vi.fn(),
  success: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      globalState: { currentYear: { id: mocks.academicYearId } },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/redux/confirmPopup/confirmPopupSlice', () => ({ setIsChanges: vi.fn() }));
vi.mock('src/hooks/useAccountSettingPermissions', () => ({
  useAccountSettingPermissions: () => ({
    canView: true,
    canAdd: true,
    canEdit: true,
    canChangeStatus: true,
    canDelete: mocks.canDelete,
  }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({
    currentQueryAndMutation,
    params,
  }: {
    currentQueryAndMutation: (params?: unknown) => unknown;
    params?: unknown;
  }) => currentQueryAndMutation(params),
}));
vi.mock('src/redux/finance/incomeCategory', () => ({
  useGetIncomeCategoriesQuery: () => ({
    currentData: {
      items: [
        {
          id: 'income',
          name: mocks.isSystem ? 'None' : 'Donations',
          isActive: mocks.isActive,
          canDelete: !mocks.isUsed && !mocks.isSystem,
          isSystemCategory: mocks.isSystem,
          isUsedInDownstream: mocks.isUsed,
          deletionBlockedReason: mocks.deletionReason,
          tags: [],
        },
      ],
      totalCount: 1,
    },
    isLoading: false,
    isFetching: false,
  }),
  usePostIncomeCategoryMutation: () => [mocks.addCategory, { isLoading: false }],
  usePutIncomeCategoryMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteIncomeCategoryMutation: () => [mocks.deleteCategory, { isLoading: mocks.deleting }],
  useGetIncomeCategoryVersionsQuery: () => ({}),
  usePatchIncomeCategoryStatusMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/finance/expenseCategory', () => ({
  useGetExpenseCategoryQuery: () => ({
    currentData: {
      items: [{ id: 'expense', name: 'Supplies', isActive: false, canDelete: true, tags: [] }],
      totalCount: 1,
    },
    isLoading: false,
    isFetching: false,
  }),
  useDeleteExpenseCategoryMutation: () => [mocks.deleteCategory, { isLoading: mocks.deleting }],
  useGetExpenseCategoryVersionsQuery: () => ({}),
  usePatchExpenseCategoryStatusMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success } }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: CustomBreadcrumbsProps) => action ?? null,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../ExpenseCategories/Components/ExpenseCategoryForm', () => ({ default: () => null }));
vi.mock('src/screens/finance/settings/components/AccountCategoryVersionDrawer', () => ({
  default: () => null,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: ICustomizableTableProps) => (
    <div>
      {data.map((row) => (
        <div key={String(row.id)}>
          {columns.map((column) => (
            <div key={column.id}>
              {column.render ? column.render(row[column.id], row) : String(row[column.id] ?? '')}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: AdaptiveThreeDotsActionsProps) => (
    <>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled}
          title={typeof action.tooltip === 'string' ? action.tooltip : undefined}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </>
  ),
}));

describe('Income category deletion', () => {
  beforeEach(() => {
    mocks.academicYearId = 'year';
    mocks.canDelete = true;
    mocks.isActive = false;
    mocks.isUsed = false;
    mocks.isSystem = false;
    mocks.deletionReason = undefined;
    mocks.deleting = false;
    mocks.addCategory.mockReset();
    mocks.deleteCategory.mockReset();
    mocks.success.mockReset();
  });

  it('requires an academic year before allowing an income category to be added', () => {
    mocks.academicYearId = undefined;
    const { rerender } = render(<FinanceIncomeCategoriesScreen />);

    expect(screen.getByRole('button', { name: 'Income Category' })).toBeDisabled();
    expect(screen.getByText('Select an academic year to manage income categories.')).toBeVisible();

    mocks.academicYearId = 'year';
    rerender(<FinanceIncomeCategoriesScreen />);

    expect(screen.getByRole('button', { name: 'Income Category' })).toBeEnabled();
  });

  it('blocks an open Add form if the year is cleared and sends the selected year on submit', async () => {
    mocks.addCategory.mockReturnValue({ unwrap: () => Promise.resolve() });
    const { rerender } = render(<FinanceIncomeCategoriesScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Income Category' }));

    const dialog = within(screen.getByRole('dialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: /Income Category Name/ }), {
      target: { value: 'Activity income' },
    });
    mocks.academicYearId = undefined;
    rerender(<FinanceIncomeCategoriesScreen />);

    const submit = dialog.getByRole('button', { name: 'Submit' });
    expect(submit).toBeDisabled();
    expect(dialog.getByRole('alert')).toHaveTextContent('Select an academic year');
    fireEvent.click(submit);
    expect(mocks.addCategory).not.toHaveBeenCalled();

    mocks.academicYearId = 'selected-year';
    rerender(<FinanceIncomeCategoriesScreen />);
    fireEvent.click(submit);
    await waitFor(() =>
      expect(mocks.addCategory).toHaveBeenCalledExactlyOnceWith({
        academicYearId: 'selected-year',
        body: { name: 'Activity income', description: '', tags: [], concurrencyStamp: null },
      })
    );
  });

  it('keeps the built-in None category available by disabling edit, status and deletion', () => {
    mocks.isSystem = true;
    mocks.isActive = true;
    render(<FinanceIncomeCategoriesScreen />);
    expect(screen.getByRole('switch', { name: 'Deactivate None' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Version history' })).toBeEnabled();
  });

  it('explains that active categories must be deactivated before deletion', () => {
    mocks.isActive = true;
    render(<FinanceIncomeCategoriesScreen />);
    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute('title', 'Deactivate this category before deleting it.');
  });

  it('deletes an unused inactive category after confirmation without a toast', async () => {
    mocks.deleteCategory.mockReturnValue({ unwrap: () => Promise.resolve() });
    render(<FinanceIncomeCategoriesScreen />);
    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toBeEnabled();
    expect(action).toHaveAttribute('title', 'Delete Donations');
    fireEvent.click(action);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Delete Income Category')).toBeInTheDocument();
    expect(mocks.deleteCategory).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(mocks.deleteCategory).toHaveBeenCalledExactlyOnceWith('income'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('leaves the record and confirmation visible when a new dependency rejects deletion', async () => {
    mocks.deleteCategory.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 409,
        data: {
          error: {
            code: 'Finance:Accounts:Settings:CategoryInUse',
            message: 'One or more business rules were violated.',
          },
        },
      }),
    });
    render(<FinanceIncomeCategoriesScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'now referenced by other Finance records'
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('shows the specific reason from a delete conflict in the confirmation', async () => {
    mocks.deleteCategory.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 409,
        data: {
          errorCode: 'Finance:Accounts:Settings:CategoryInUse',
          detail: 'Used by transactions.',
        },
      }),
    });
    render(<FinanceIncomeCategoriesScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.click(dialog.getByRole('button', { name: 'Delete' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('Used by transactions.');
  });

  it('blocks referenced categories and explains their actual dependency state', () => {
    mocks.isUsed = true;
    mocks.deletionReason = 'Used by fee heads.';
    render(<FinanceIncomeCategoriesScreen />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'title',
      'Used by fee heads.'
    );
    expect(mocks.deleteCategory).not.toHaveBeenCalled();
  });

  it('preserves the exact Delete permission guard and explains permission denial', () => {
    mocks.canDelete = false;
    render(<FinanceIncomeCategoriesScreen />);
    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute(
      'title',
      'You do not have permission to delete income categories.'
    );
  });

  it('keeps the dependency restriction when an older server omits the reason', () => {
    mocks.isUsed = true;
    render(<FinanceIncomeCategoriesScreen />);
    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute(
      'title',
      expect.stringContaining('referenced by other Finance records')
    );
  });

  it('locks Cancel and Delete while the server deletion is pending', () => {
    const { rerender } = render(<FinanceIncomeCategoriesScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    mocks.deleting = true;
    rerender(<FinanceIncomeCategoriesScreen />);
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('retains an expense category and offers retry when the server rejects deletion', async () => {
    mocks.deleteCategory
      .mockReturnValueOnce({
        unwrap: vi.fn().mockRejectedValue({
          status: 409,
          data: { detail: 'Used by a refund policy.' },
        }),
      })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve() });

    render(<FinanceExpenseCategoriesScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.click(dialog.getByRole('button', { name: 'Delete' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('Used by a refund policy.');
    expect(screen.getAllByText('Supplies')).toHaveLength(2);
    expect(mocks.success).not.toHaveBeenCalled();
    fireEvent.click(dialog.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.deleteCategory).toHaveBeenCalledTimes(2);
    expect(mocks.success).toHaveBeenCalledOnce();
  });
});
