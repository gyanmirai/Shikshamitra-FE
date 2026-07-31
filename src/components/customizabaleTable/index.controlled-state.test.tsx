import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { act, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

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
