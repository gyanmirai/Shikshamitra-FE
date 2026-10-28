import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { act, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

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
  it('reports only visible data columns to the owning server search', () => {
    const visible = vi.fn();
    const table = renderTable(<CustomizableTable tableId="academic-visible-server-search" columns={[
      { id: 'roomName', label: 'Room' }, { id: 'purpose', label: 'Purpose', defaultHidden: true },
      { id: 'actions', label: 'Actions' },
    ]} data={[]} onVisibleColumnsChange={visible} />);
    expect(visible).toHaveBeenLastCalledWith(['roomName']);
    table.rerender(<ThemeProvider theme={createTheme(defaultSettings)}><CustomizableTable tableId="academic-visible-server-search" columns={[
      { id: 'roomName', label: 'Room' }, { id: 'date', label: 'Date' }, { id: 'actions', label: 'Actions' },
    ]} data={[]} onVisibleColumnsChange={visible} /></ThemeProvider>);
    expect(visible).toHaveBeenLastCalledWith(['roomName', 'date']);
  });

  it('retains categorical options and supported operators with operational field metadata', async () => {
    const filter = vi.fn();
    renderTable(
      <CustomizableTable
        tableId="hr-enum-operational"
        data={[]}
        columns={[
          {
            id: 'visibleInPayslip',
            label: 'Visible in payslip',
            filterType: 'enum',
            enumOptions: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
            filterOperators: ['equals'],
          },
        ]}
        serverColumnTypes={{ visibleInPayslip: 'string' }}
        serverSidePagination
        serverSideFilter
        onServerFilter={filter}
        onServerSort={vi.fn()}
        totalCount={250}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter Visible in payslip' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Visible in payslip *' }));
    fireEvent.click(screen.getByRole('option', { name: 'No' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });
    expect(filter).toHaveBeenCalledWith([
      expect.objectContaining({
        column: 'visibleInPayslip',
        type: 'equals',
        value: false,
        valueType: 'enum',
      }),
    ]);
  });
  it('uses explicit server field capabilities without sorting loaded rows or enabling action criteria', () => {
    const sort = vi.fn();
    renderTable(
      <CustomizableTable
        tableId="hr-operational-capabilities"
        columns={[
          { id: 'amount', label: 'Amount', isSort: false, isFilter: false },
          { id: 'actions', label: 'Actions' },
        ]}
        serverColumnTypes={{ amount: 'money' }}
        data={[
          { id: 'first', amount: 10 },
          { id: 'second', amount: 2 },
        ]}
        serverSidePagination
        serverSideSort
        serverSideFilter
        onServerSort={sort}
        onServerFilter={vi.fn()}
        totalCount={301}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Amount' }));
    expect(sort).toHaveBeenCalledWith('amount', [{ column: 'amount', direction: 'asc' }]);
    expect(screen.queryByRole('button', { name: 'Sort by Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filter Actions' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Filter Amount' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Equals' }));
    expect(screen.getByRole('spinbutton', { name: 'Amount *' })).toHaveAttribute('step', 'any');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // The existing order is retained until the owner supplies the globally ordered response.
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('10');
  });
  it('retains safe rows and labels refresh without reporting an empty or initial-loading state', () => {
    renderTable(
      <CustomizableTable
        tableId="hr-refresh-regression"
        tableTitle="Work calendars"
        columns={columns}
        data={[{ name: 'School calendar' }]}
        isRefreshing
        isLoading={false}
      />
    );
    expect(screen.getByText('School calendar')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Refreshing Work calendars' })).toBeVisible();
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
  });

  it('shows a selected 50-row limit and disables Next on the final counted page', () => {
    renderTable(
      <CustomizableTable
        tableId="hr-counted-final-page"
        columns={columns}
        data={[{ name: 'Staff' }]}
        serverSidePagination
        totalCount={30}
        page={0}
        rowsPerPage={50}
      />
    );
    expect(screen.getByRole('combobox', { name: /Rows per page/ })).toHaveTextContent('50');
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });
  it('mounts one table in full screen and restores focus after closing it', async () => {
    vi.useRealTimers();
    renderTable(
      <CustomizableTable
        tableId="hr-single-fullscreen"
        columns={columns}
        data={[]}
        showFullScreen
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Full screen' }));
    });
    expect(screen.getAllByRole('table')).toHaveLength(1);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Exit full screen' }));
    });
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Full screen' })).toHaveFocus();
  });
  it('keeps table utilities available when search and column filters are disabled', () => {
    renderTable(
      <CustomizableTable
        tableId="hr-independent-utilities"
        columns={columns}
        data={[]}
        isSearch={false}
        isFilter={false}
        showColumns
        showExport
        showFullScreen
      />
    );
    expect(screen.getByRole('button', { name: 'Columns' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export' })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Full screen$/ })).toBeVisible();
  });
  it('requires a complete server source instead of silently exporting one loaded page', () => {
    renderTable(
      <CustomizableTable
        tableId="hr-complete-export-required"
        columns={columns}
        data={[{ name: 'One loaded row' }]}
        serverSidePagination
        totalCount={25001}
        exportScope="all"
        showExport
      />
    );
    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
  });
  it('uses unknown-total pagination without inventing a count and retains the footer without density', () => {
    renderTable(
      <CustomizableTable
        tableId="hr-unknown-count"
        columns={columns}
        data={[]}
        serverSidePagination
        paginationMode="unknown"
        hasNextPage={false}
        page={2}
        rowsPerPage={50}
        isShowedDense={false}
      />
    );
    expect(screen.getByText('Page 3')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeEnabled();
  });
  it('delegates the entire query and visible data columns to the server export', async () => {
    const exportAll = vi.fn().mockResolvedValue(undefined);
    renderTable(
      <CustomizableTable
        tableId="hr-server-export"
        columns={[
          ...columns,
          { id: 'actions', label: 'Actions' },
          { id: 'select', label: '' },
          { id: 'hidden', label: 'Hidden', defaultHidden: true },
        ]}
        data={[{ name: 'Loaded row' }]}
        serverSidePagination
        totalCount={25001}
        exportScope="all"
        onExport={exportAll}
        showExport
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Excel' }));
    });
    expect(exportAll).toHaveBeenCalledTimes(1);
    expect(exportAll.mock.calls[0][0].columns.map((column: { id: string }) => column.id)).toEqual([
      'name',
    ]);
    expect(exportAll.mock.calls[0][0].format).toBe('excel');
    expect(exportAll.mock.calls[0][0]).not.toHaveProperty('rows');
  });
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

it('reports zero-based client pagination to URL-owning screens', () => {
  const onPaginationChange = vi.fn();
  renderTable(
    <CustomizableTable
      tableId="report-url-pagination"
      columns={columns}
      data={Array.from({ length: 30 }, (_, i) => ({ name: `Staff ${i}` }))}
      rowsPerPage={10}
      onPaginationChange={onPaginationChange}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(onPaginationChange).toHaveBeenCalledWith(1, 10);
});
