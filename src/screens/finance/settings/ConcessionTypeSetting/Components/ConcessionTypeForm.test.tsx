import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ConcessionTypeForm from './ConcessionTypeForm';

const detailQuery = vi.hoisted(() => ({
  currentData: undefined as { data: Record<string, unknown> } | undefined,
  isLoading: true,
  isFetching: true,
  refetch: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'year-2026' } } }),
}));
vi.mock('src/redux/finance/concessionType', () => ({
  useGetConcessionTypeByIdQuery: () => detailQuery,
  useGetConcessionTypesQuery: () => ({ data: { data: { items: [] } } }),
  usePutConcessionTypeMutation: () => [vi.fn(), { isLoading: false }],
  usePostConcessionTypeMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) =>
    currentQueryAndMutation(),
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  DownstreamUsageWarning: () => null,
}));

const onClose = vi.fn();
const props = {
  open: { value: true, onTrue: vi.fn(), onFalse: vi.fn(), onToggle: vi.fn(), setValue: vi.fn() },
  onClose,
  editData: { id: 'type-1', name: 'Sibling Discount', documents: [] },
};

beforeEach(() => {
  vi.clearAllMocks();
  detailQuery.currentData = undefined;
  detailQuery.isLoading = true;
  detailQuery.isFetching = true;
});

describe('Concession Type update loading', () => {
  it('keeps the footer visible with Update disabled until details replace the skeleton', async () => {
    const view = render(<ConcessionTypeForm {...props} />);
    expect(screen.getByRole('status', { name: 'Loading concession type details' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    detailQuery.currentData = {
      data: {
        id: 'type-1',
        name: 'Saved Sibling Discount',
        documents: [],
        description: 'Saved description',
      },
    };
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    view.rerender(<ConcessionTypeForm {...props} />);
    await waitFor(() =>
      expect(screen.getByLabelText('Concession Type Name *')).toHaveValue('Saved Sibling Discount')
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
    expect(screen.getByLabelText('Description')).toHaveValue('Saved description');
  });

  it('offers Retry after a failed load and prevents updating empty defaults', () => {
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    render(<ConcessionTypeForm {...props} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load concession type details.');
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(detailQuery.refetch).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledWith(null, false);
  });

  it('keeps the create form ready without a details request', () => {
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    render(<ConcessionTypeForm {...props} editData={null} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Concession Type Name *' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
