import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import FeeCategoryCreation from '.';

const fixture = vi.hoisted(() => {
  const category = {
    id: 'category-1',
    academicYearId: 'year-1',
    name: 'Academic Fees 2026-27',
    description: 'Saved academic category',
    isActive: true,
    isUsedInDownstream: false,
    feeHeads: [
      {
        id: 'head-1',
        incomeCategoryId: 'income-1',
        name: 'Tuition Fee',
        description: 'Saved tuition head',
        isConcessionApplied: true,
        isUsedInDownstream: false,
      },
    ],
  };
  const listResult = {
    data: { items: [category], totalCount: 1 },
    isLoading: false,
    isFetching: false,
  };
  const detailResult = { data: category, isLoading: false, isFetching: false };
  const routingResult = {
    data: { items: [{ id: 'income-1', name: 'School Fee Income [INC-1]' }] },
    isLoading: false,
    isFetching: false,
  };
  const listHook = vi.fn(() => listResult);
  const detailHook = vi.fn();
  const routingHook = vi.fn();
  const addHook = vi.fn();
  const updateHook = vi.fn();
  const mutate = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
  return {
    category,
    listResult,
    detailResult,
    routingResult,
    listHook,
    detailHook,
    routingHook,
    addHook,
    updateHook,
    mutate,
    push: vi.fn(),
  };
});

vi.mock('src/redux/feeCategory/feeCategoryApi', () => ({
  useGetFeeCategoriesQuery: fixture.listHook,
  useGetFeeCategoryByIdQuery: fixture.detailHook,
  useAddFeeCategoryMutation: fixture.addHook,
  useUpdateFeeCategoryMutation: fixture.updateHook,
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: fixture.routingHook,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({
    type,
    currentQueryAndMutation,
  }: {
    type: string;
    currentQueryAndMutation: unknown;
  }) => {
    if (type === 'mutation') return [fixture.mutate, { isLoading: false }];
    if (currentQueryAndMutation === fixture.detailHook) return fixture.detailResult;
    if (currentQueryAndMutation === fixture.routingHook) return fixture.routingResult;
    return fixture.listResult;
  },
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: fixture.push }) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action?: ReactNode }) => <header>{action}</header>,
}));
vi.mock('./Components/FeeCategoryTable', () => ({
  default: ({
    setEditData,
    onAddFeeCategory,
  }: {
    setEditData: (record: unknown) => void;
    onAddFeeCategory: { onTrue: () => void };
  }) => (
    <button
      onClick={() => {
        setEditData(fixture.category);
        onAddFeeCategory.onTrue();
      }}
    >
      Edit saved category
    </button>
  ),
}));
vi.mock('./Components/FeeCategoryView', () => ({ default: () => null }));

function renderCategories() {
  const store = configureStore({
    reducer: {
      confirmPopup,
      globalState: (state = { currentYear: { id: 'year-1' } }) => state,
      auth: (state = { permissions: {} }) => state,
    },
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <FeeCategoryCreation />
      </Provider>
    ),
  };
}

describe('Fee Category parent and actual form lifecycle', () => {
  it('closes an untouched edit and always opens Create with one blank head', async () => {
    const { store } = renderCategories();
    fireEvent.click(screen.getByRole('button', { name: 'Edit saved category' }));
    expect(screen.getByRole('heading', { name: 'Update Fee Category' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveValue(
      'Academic Fees 2026-27'
    );
    expect(screen.getByRole('textbox', { name: 'Fee head name *' })).toHaveValue('Tuition Fee');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Update Fee Category' })).not.toBeInTheDocument()
    );
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Add Fee Category' }));
    expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveValue('');
    expect(screen.getAllByRole('textbox', { name: 'Fee head name *' })).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Fee head name *' })).toHaveValue('');
    screen
      .getAllByRole('textbox', { name: 'Description (optional)' })
      .forEach((field) => expect(field).toHaveValue(''));
    fireEvent.click(screen.getByRole('button', { name: 'Close fee category editor' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Add Fee Category' })).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })
    ).not.toBeInTheDocument();
  });

  it('keeps dirty values until Discard, then clears the real Redux guard and subsequent clean closes', async () => {
    const { store } = renderCategories();
    fireEvent.click(screen.getByRole('button', { name: 'Add Fee Category' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Category name *' }), {
      target: { value: 'New category' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Fee head name *' }), {
      target: { value: 'New head' },
    });
    await waitFor(() => expect(store.getState().confirmPopup.isChanges).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveValue('New Category');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Add Fee Category' })).not.toBeInTheDocument()
    );
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Add Fee Category' }));
    expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Add Fee Category' })).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })
    ).not.toBeInTheDocument();
  });
});
