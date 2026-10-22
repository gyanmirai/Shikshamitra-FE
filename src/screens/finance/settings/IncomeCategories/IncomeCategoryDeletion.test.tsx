import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsActionsProps } from 'src/components/adaptive-three-dots-actions/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import FinanceIncomeCategoriesScreen from './index';

const mocks = vi.hoisted(() => ({
  canDelete: true,
  isUsed: false,
  deletionReason: undefined as string | null | undefined,
  deleting: false,
  deleteCategory: vi.fn(),
  success: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      globalState: { currentYear: { id: 'year' } },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/redux/confirmPopup/confirmPopupSlice', () => ({ setIsChanges: vi.fn() }));
vi.mock('src/hooks/useAccountSettingPermissions', () => ({
  useAccountSettingPermissions: () => ({
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
    data: {
      items: [
        {
          id: 'income',
          name: 'Donations',
          isActive: true,
          canDelete: !mocks.isUsed,
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
  useDeleteIncomeCategoryMutation: () => [mocks.deleteCategory, { isLoading: mocks.deleting }],
  useGetIncomeCategoryVersionsQuery: () => ({}),
  usePatchIncomeCategoryStatusMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('./Components/IncomeCategoryForm', () => ({ default: () => null }));
vi.mock('src/screens/finance/settings/components/AccountSettingVersionDialog', () => ({
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
    mocks.canDelete = true;
    mocks.isUsed = false;
    mocks.deletionReason = undefined;
    mocks.deleting = false;
    mocks.deleteCategory.mockReset();
    mocks.success.mockReset();
  });

  it('allows an unused active category, then sends DELETE only after confirmation succeeds', async () => {
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
    expect(mocks.success).toHaveBeenCalled();
  });

  it('leaves the record and confirmation visible when a new dependency rejects deletion', async () => {
    mocks.deleteCategory.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Category in use'), {
            data: {
              error: {
                code: 'Finance:Accounts:Settings:CategoryInUse',
                message: 'One or more business rules were violated.',
              },
            },
          })
        ),
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
});
