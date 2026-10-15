import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { act, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

// Keep table behavior real without loading the entire icon asset library.
vi.mock('@mui/icons-material', () => {
  const Icon = () => null;
  return {
    ArrowDownward: Icon,
    ArrowUpward: Icon,
    Clear: Icon,
    ExpandLess: Icon,
    ExpandMore: Icon,
    RemoveRedEye: Icon,
    Search: Icon,
  };
});

const columns = [
  {
    id: 'name',
    label: 'Name',
    isSort: false,
    isFilter: false,
  },
];

const renderTable = (table: ReactElement) =>
  renderWithProviders(<ThemeProvider theme={createTheme(defaultSettings)}>{table}</ThemeProvider>);

describe('CustomizableTable controlled server state', () => {
  it('shows all rows without pagination and preserves opt-in expanded content', () => {
    const data = Array.from({ length: 35 }, (_, index) => ({
      id: String(index),
      name: `Feature ${index}`,
    }));
    renderTable(
      <CustomizableTable
        tableId="permission-unpaginated"
        columns={columns}
        data={data}
        isPagination={false}
        showToolbar={false}
        renderExpandedRow={(row) => (row.id === '34' ? <div>Editable detail</div> : null)}
      />
    );
    expect(screen.getByText('Feature 34')).toBeVisible();
    expect(screen.getByText('Editable detail').closest('td')).toHaveAttribute('colspan', '1');
    expect(screen.queryByRole('textbox', { name: /search/i })).not.toBeInTheDocument();
  });
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a controlled deep-link page while hydrating search and filters', () => {
    renderTable(
      <CustomizableTable
        tableId="controlled-deep-link"
        columns={columns}
        data={[{ id: 'lead-1', name: 'Patel' }]}
        serverSide
        serverSidePagination
        serverSideSearch
        totalCount={100}
        page={2}
        rowsPerPage={25}
        searchTerm="patel"
        filters={[
          {
            column: 'name',
            type: 'contains',
            value: 'patel',
            valueType: 'string',
          },
        ]}
        onServerPagination={vi.fn()}
        onServerSearch={vi.fn()}
      />
    );

    expect(screen.getByRole('textbox', { name: /search/i })).toHaveValue('patel');
    expect(screen.getByText('51–75 of 100')).toBeVisible();
  });

  it('reports one-based server pages while displaying zero-based controlled pages', () => {
    const onServerPagination = vi.fn();
    const props = {
      tableId: 'controlled-pagination-contract',
      columns,
      data: [{ id: 'lead-1', name: 'Patel' }],
      serverSidePagination: true,
      totalCount: 95,
      rowsPerPage: 10,
      onServerPagination,
    };
    const { rerender } = renderTable(<CustomizableTable {...props} page={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onServerPagination).toHaveBeenLastCalledWith(2, 10);
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomizableTable {...props} page={1} />
      </ThemeProvider>
    );
    expect(screen.getByText('11–20 of 95')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onServerPagination).toHaveBeenLastCalledWith(1, 10);
  });

  it('keeps typed search text until the server debounce reaches the parent', () => {
    const onServerSearch = vi.fn();
    renderTable(
      <CustomizableTable
        tableId="controlled-search"
        columns={columns}
        data={[{ id: 'lead-1', name: 'Patel' }]}
        serverSide
        serverSideSearch
        searchTerm="patel"
        onServerSearch={onServerSearch}
      />
    );

    act(() => vi.advanceTimersByTime(500));
    onServerSearch.mockClear();

    const search = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'patel family' } });

    expect(search).toHaveValue('patel family');
    expect(onServerSearch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(500));
    expect(onServerSearch).toHaveBeenCalledOnce();
    expect(onServerSearch).toHaveBeenCalledWith('patel family');
  });

  it('hydrates controlled sorting and reports the complete server sort order', () => {
    const onServerSort = vi.fn();
    renderTable(
      <CustomizableTable
        tableId="controlled-sorting"
        columns={[
          { id: 'name', label: 'Name', originalId: 'ApplicantName' },
          { id: 'createdAt', label: 'Created at' },
        ]}
        data={[{ id: 'lead-1', name: 'Patel', createdAt: '2026-07-31' }]}
        serverSide
        serverSideSort
        serverSideSortMode="single"
        sorts={[{ column: 'name', direction: 'desc', originalId: 'ApplicantName' }]}
        onServerSort={onServerSort}
      />
    );

    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute(
      'aria-sort',
      'descending'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sort by Name' }));
    expect(onServerSort).toHaveBeenLastCalledWith('name', [
      { column: 'name', direction: 'asc', originalId: 'ApplicantName' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by Created at' }));

    expect(onServerSort).toHaveBeenCalledWith('createdAt', [
      { column: 'createdAt', direction: 'asc', originalId: undefined },
    ]);
  });
});
