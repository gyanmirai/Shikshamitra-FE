import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TableBody } from './TableBody';

vi.mock('../../empty-content', () => ({
  EmptyContent: ({ title }: { title: ReactNode }) => (
    <div data-testid="default-empty-content">{title}</div>
  ),
}));

describe('CustomizableTable empty state', () => {
  it('renders a supplied custom empty state directly without the default empty wrapper', () => {
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
    expect(screen.queryByTestId('default-empty-content')).not.toBeInTheDocument();
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
});
