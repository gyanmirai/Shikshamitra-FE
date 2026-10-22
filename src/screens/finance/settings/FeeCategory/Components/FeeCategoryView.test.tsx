import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import FeeCategoryView from './FeeCategoryView';

const { queryState } = vi.hoisted(() => ({
  queryState: {
    currentData: undefined as any,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => queryState }));
vi.mock('src/redux/feeCategory/feeCategoryApi', () => ({ useGetFeeCategoryByIdQuery: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('Fee category details', () => {
  beforeEach(() => {
    Object.assign(queryState, {
      currentData: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    queryState.refetch.mockClear();
  });

  it('keeps loading distinct from empty and failed results', () => {
    queryState.isLoading = true;
    const { rerender } = render(<FeeCategoryView id="category-1" />);
    expect(
      screen.getByRole('status', { name: 'Loading fee category details' })
    ).toBeInTheDocument();
    expect(screen.queryByText('No fee heads are mapped to this category.')).toBeNull();

    queryState.isLoading = false;
    queryState.isError = true;
    rerender(<FeeCategoryView id="category-1" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Fee category details could not be loaded.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(queryState.refetch).toHaveBeenCalledOnce();
  });

  it('shows each saved income category once and makes concession states explicit', () => {
    const longName = 'A very long fee head name '.repeat(8);
    queryState.currentData = {
      name: 'School Fees',
      description: 'Annual school fees',
      isActive: true,
      feeHeads: [
        {
          id: 'head-1',
          name: longName,
          description: 'Tuition',
          incomeCategoryName: 'Main School Income',
          isConcessionApplied: true,
        },
        {
          id: 'head-2',
          name: 'Bus',
          description: '',
          incomeCategoryName: 'Transport Income',
          isConcessionApplied: false,
        },
        {
          id: 'head-3',
          name: 'Meals',
          description: 'Lunch',
          incomeCategoryName: '',
          isConcessionApplied: false,
        },
      ],
    };
    render(<FeeCategoryView id="category-1" />);

    expect(screen.getByRole('heading', { name: 'School Fees' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fee Heads (3)' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Category Details information' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getAllByText('Main School Income')).toHaveLength(1);
    expect(screen.queryByText('Income Category: Main School Income')).toBeNull();
    const tuition = screen.getByRole('article', { name: longName.trim() });
    expect(within(tuition).getByText('Yes')).toBeInTheDocument();
    expect(within(tuition).getByRole('heading')).toHaveTextContent(longName.trim());
    expect(
      within(screen.getByRole('article', { name: 'Bus' })).getByText('No')
    ).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('shows a successful empty category without inventing fee heads', () => {
    queryState.currentData = { name: 'Empty category', isActive: false, feeHeads: [] };
    render(<FeeCategoryView id="category-1" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('No fee heads are mapped to this category.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).toBeNull();
  });
});
