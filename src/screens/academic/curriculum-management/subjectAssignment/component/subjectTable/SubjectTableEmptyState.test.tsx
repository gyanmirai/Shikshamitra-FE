import type { ComponentProps } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { SubjectTableEmptyState } from './SubjectTableEmptyState';

describe('SubjectTableEmptyState', () => {
  const renderState = (overrides: Partial<ComponentProps<typeof SubjectTableEmptyState>> = {}) => {
    const props: ComponentProps<typeof SubjectTableEmptyState> = {
      hasSubjects: true,
      searchTerm: 'eeee',
      canAdd: true,
      onAllocate: vi.fn(),
      onClearSearch: vi.fn(),
      ...overrides,
    };

    render(<SubjectTableEmptyState {...props} />);
    return props;
  };

  it('shows a search-specific message without an allocation action when subjects exist', () => {
    const props = renderState();

    expect(screen.getByText('No results found for “eeee”.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /allocate subjects/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(props.onClearSearch).toHaveBeenCalledOnce();
  });

  it('shows a filter-specific message when existing subjects are filtered without search text', () => {
    renderState({ searchTerm: '' });

    expect(screen.getByText('No subjects match the current filters.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /allocate subjects/i })).not.toBeInTheDocument();
  });

  it('keeps the allocation prompt for a class that genuinely has no subjects', () => {
    const props = renderState({ hasSubjects: false, searchTerm: '' });

    expect(screen.getByText('No subjects allocated for this class yet.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /allocate subjects/i }));
    expect(props.onAllocate).toHaveBeenCalledOnce();
  });
});
