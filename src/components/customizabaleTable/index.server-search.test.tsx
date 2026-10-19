import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { act, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const columns = [{ id: 'fullName', label: 'Name' }];
const employee = { id: 'employee-1', fullName: 'Abhay Bamrotiya' };

describe('server employee search results', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([
    'Abh',
    'Abhay Bamrotiya',
    '  ABHAY   BAMROTIYA  ',
    'Bamrotiya Abhay',
    'Abhay Kumar Bamrotiya',
    'Abhay\u00a0Bamrotiya',
  ])('keeps the server match for %j and forwards the complete query', (query) => {
    const onSearch = vi.fn();
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomizableTable
          tableId="employee-server-search"
          columns={columns}
          data={[employee]}
          serverSideSearch
          serverSidePagination
          totalCount={1}
          onServerSearch={onSearch}
          noDataText="No Employee Found"
        />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: query },
    });
    act(() => vi.advanceTimersByTime(500));

    expect(onSearch).toHaveBeenLastCalledWith(query);
    expect(screen.getByText(employee.fullName)).toBeVisible();
    expect(screen.queryByText('No Employee Found')).not.toBeInTheDocument();
    expect(screen.getByText('1–1 of 1')).toBeVisible();
  });

  it('keeps a full-name match when legacy data contains collapsed display whitespace', () => {
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomizableTable
          tableId="employee-legacy-spacing"
          columns={columns}
          data={[{ ...employee, fullName: 'Abhay  Bamrotiya' }]}
          defaultSearchTerm="Abhay Bamrotiya"
          serverSideSearch
          noDataText="No Employee Found"
        />
      </ThemeProvider>
    );

    expect(screen.getByText(employee.fullName)).toBeVisible();
    expect(screen.queryByText('No Employee Found')).not.toBeInTheDocument();
  });
});
