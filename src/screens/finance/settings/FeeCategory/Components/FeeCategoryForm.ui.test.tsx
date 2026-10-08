import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import FeeCategoryForm from './FeeCategoryForm';

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
  it('groups category fields and keeps both descriptions visible', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Add Fee Category' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About fee categories' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About category details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About fee heads' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Category Details' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Fee Heads' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add Fee Head' }));

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
});
