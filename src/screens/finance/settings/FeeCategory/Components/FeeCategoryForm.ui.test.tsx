import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import FeeCategoryForm from './FeeCategoryForm';

vi.mock('src/screens/finance/hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ canView: true, canAdd: true }),
}));

vi.mock('src/redux/feeCategory/feeCategoryApi', () => ({
  useGetFeeCategoriesQuery: vi.fn(),
  useAddFeeCategoryMutation: vi.fn(),
  useGetFeeCategoryByIdQuery: vi.fn(),
  useUpdateFeeCategoryMutation: vi.fn(),
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: vi.fn(),
}));
vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: 'year-1' } } }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, params }: { type: string; params?: { operation?: string } }) => {
    if (type === 'mutation') return [vi.fn(), { isLoading: false }];
    if (params?.operation === 'fee-head') {
      return {
        data: { items: [{ id: 'income-1', name: 'School Fee Income [ABC123]' }] },
        isLoading: false,
        isFetching: false,
      };
    }
    return { data: { items: [] }, isLoading: false, isFetching: false };
  },
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/screens/hr/policies/components/HRPolicySharedUI', () => ({
  DrawerHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  default: () => null,
}));

const renderForm = () =>
  render(<FeeCategoryForm open={{ value: true } as never} onClose={vi.fn()} editData={null} />);

describe('Fee category editor', () => {
  it('blocks removal of an assigned fee head and explains the exact dependencies', () => {
    const head = {
      id: 'assigned-head',
      name: 'FH3',
      incomeCategoryId: 'income-1',
      isConcessionApplied: false,
      isUsedInDownstream: true,
      dependencies: {
        studentCount: 1,
        assignmentCount: 1,
        feeStructureCount: 1,
        paymentTermCount: 1,
        isBlocked: true,
      },
    };
    render(
      <FeeCategoryForm
        open={{ value: true } as never}
        onClose={vi.fn()}
        editData={
          {
            id: 'category-1',
            name: '8th Fee Category',
            feeHeads: [
              head,
              {
                ...head,
                id: 'unused-head',
                name: 'Unused',
                isUsedInDownstream: false,
                dependencies: undefined,
              },
            ],
          } as never
        }
      />
    );
    expect(screen.getByRole('button', { name: 'Remove FH3' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Unused' })).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'FH3 is used by 1 student, 1 assignment, 1 fee structure, and 1 payment term'
    );
    expect(screen.getByRole('link', { name: 'Review Fee Assignments' })).toHaveAttribute(
      'href',
      '/finance/fee-structure-assign?feeHeadId=assigned-head'
    );
  });

  it('groups category fields and keeps both descriptions visible', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Add Fee Category' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About fee categories' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'About category details' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'About fee heads' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Category Details' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Fee Heads' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Category name *' }), {
      target: { value: 'school transport' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Fee head name *' }), {
      target: { value: 'bus service' },
    });

    expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveValue(
      'School Transport'
    );
    expect(screen.getByRole('textbox', { name: 'Fee head name *' })).toHaveValue('Bus Service');

    expect(screen.getByRole('button', { name: 'Remove Bus Service' })).toBeDisabled();
    expect(screen.getAllByRole('textbox', { name: 'Description (optional)' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Add description' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Fee head 1: Bus Service' })).toHaveTextContent('01');
  });

  it('focuses the first invalid field after submission', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Category name *' })).toHaveFocus()
    );
    expect(screen.getByText('Category Name is required')).toBeInTheDocument();
  });

  it('keeps each concession switch associated with its fee head and preserves removal guards', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Remove fee head 1' })).toBeDisabled();
    const firstToggle = screen.getByRole('switch', { name: 'Enable concessions for fee head 1' });
    expect(firstToggle).not.toBeChecked();
    fireEvent.click(firstToggle);
    expect(firstToggle).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Add Fee Head' }));
    expect(screen.getAllByRole('switch', { name: /Enable concessions for fee head/ })).toHaveLength(
      2
    );
    expect(screen.getByRole('button', { name: 'Remove fee head 1' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Remove fee head 2' })).toBeEnabled();
  });
});
