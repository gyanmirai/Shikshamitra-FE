import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TableBody } from './TableBody';

vi.mock('../../empty-content', () => ({
  EmptyContent: ({
    title,
    description,
    action,
  }: {
    title: ReactNode;
    description?: string;
    action?: ReactNode;
  }) => (
    <div data-testid="default-empty-content">
      {title}
      {description}
      {action}
    </div>
  ),
}));

describe('CustomizableTable empty state', () => {
  it('renders a supplied custom empty state for a genuinely empty table', () => {
    render(
      <table>
        <TableBody
          isLoading={false}
          data={[]}
          columns={[{ id: 'name', label: 'Name' }]}
          columnVisibility={{ name: true }}
          getStickyStyle={() => ({})}
          dense={false}
          onRowClick={vi.fn()}
          rowProps={() => ({})}
          expandedRows={{}}
          onExpandRow={vi.fn()}
          noDataText={<div data-testid="custom-empty-content">No exports yet</div>}
          tableRef={600}
        />
      </table>
    );

    expect(screen.getByTestId('custom-empty-content')).toBeVisible();
  });

  it('retains the default wrapper for a plain-text empty message', () => {
    render(
      <table>
        <TableBody
          isLoading={false}
          data={[]}
          columns={[{ id: 'name', label: 'Name' }]}
          columnVisibility={{ name: true }}
          getStickyStyle={() => ({})}
          dense={false}
          onRowClick={vi.fn()}
          rowProps={() => ({})}
          expandedRows={{}}
          onExpandRow={vi.fn()}
          noDataText="No data available"
          tableRef={600}
        />
      </table>
    );

    expect(screen.getByTestId('default-empty-content')).toHaveTextContent('No data available');
  });

  it('replaces the true empty state with search-specific feedback and clears the criteria', () => {
    const onClearCriteria = vi.fn();

    render(
      <table>
        <TableBody
          isLoading={false}
          data={[]}
          columns={[{ id: 'name', label: 'Name' }]}
          columnVisibility={{ name: true }}
          getStickyStyle={() => ({})}
          dense={false}
          onRowClick={vi.fn()}
          rowProps={() => ({})}
          expandedRows={{}}
          onExpandRow={vi.fn()}
          noDataText={<div>Create Exam</div>}
          tableRef={600}
          searchTerm="  aaaa  "
          onClearCriteria={onClearCriteria}
        />
      </table>
    );

    expect(screen.getByTestId('default-empty-content')).toHaveTextContent(
      'No results found for “aaaa”'
    );
    expect(screen.queryByText('Create Exam')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClearCriteria).toHaveBeenCalledOnce();
  });

  it('uses filter-specific feedback when column filters return no rows', () => {
    render(
      <table>
        <TableBody
          isLoading={false}
          data={[]}
          columns={[{ id: 'name', label: 'Name' }]}
          columnVisibility={{ name: true }}
          getStickyStyle={() => ({})}
          dense={false}
          onRowClick={vi.fn()}
          rowProps={() => ({})}
          expandedRows={{}}
          onExpandRow={vi.fn()}
          noDataText="No employees exist"
          tableRef={600}
          hasActiveFilters
          onClearCriteria={vi.fn()}
        />
      </table>
    );

    expect(screen.getByTestId('default-empty-content')).toHaveTextContent('No results found');
    expect(screen.queryByText('No employees exist')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });
});
