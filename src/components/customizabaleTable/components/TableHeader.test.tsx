import { Table, Checkbox } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { TableHeader } from './TableHeader';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

describe('TableHeader', () => {
  it('keeps headings left aligned when numeric and action cells align right', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Table>
          <TableHeader
            columns={[
              { id: 'amount', label: 'Amount', align: 'right', isSort: true },
              { id: 'actions', label: 'Actions', align: 'right', isSort: false, isFilter: false },
            ]}
            columnVisibility={{ amount: true, actions: true }}
            sorts={[]}
            onSort={vi.fn()}
            filters={[]}
            onColumnFilterClick={vi.fn()}
            headerRefs={[]}
            setHeaderRef={vi.fn()}
            getStickyStyle={() => ({})}
            tableUniqId="heading-alignment"
          />
        </Table>
      </ThemeProvider>
    );
    expect(screen.getByText('Amount')).toHaveStyle({ textAlign: 'left' });
    const neutralSort = screen
      .getByRole('button', { name: 'Sort by Amount' })
      .querySelector('[data-testid="UnfoldMoreIcon"]');
    expect(neutralSort).toBeVisible();
    expect(neutralSort?.parentElement).toHaveStyle({ opacity: '1' });
    expect(screen.getByText('Actions')).toHaveStyle({ textAlign: 'left' });
    expect(screen.queryByRole('button', { name: 'Sort by Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filter Actions' })).not.toBeInTheDocument();
  });

  it('does not clip custom header controls inside narrow columns', () => {
    const theme = createTheme(defaultSettings);

    render(
      <ThemeProvider theme={theme}>
        <Table>
          <TableHeader
            columns={[
              {
                id: 'selection',
                label: '',
                width: 56,
                minWidth: 56,
                maxWidth: 56,
                isSort: false,
                isFilter: false,
                renderColumn: () => <Checkbox aria-label="Select visible rows" size="small" />,
              },
              { id: 'applicant', label: 'Applicant', isSort: false, isFilter: false },
            ]}
            columnVisibility={{ selection: true, applicant: true }}
            sorts={[]}
            onSort={vi.fn()}
            filters={[]}
            onColumnFilterClick={vi.fn()}
            headerRefs={[]}
            setHeaderRef={vi.fn()}
            getStickyStyle={() => ({})}
            tableUniqId="selection-regression"
          />
        </Table>
      </ThemeProvider>
    );

    expect(
      screen
        .getByRole('columnheader', { name: 'Select visible rows' })
        .querySelector('.customizable-table-header-content')
    ).toHaveStyle({ overflow: 'visible' });
    expect(screen.getByText('Applicant')).toHaveStyle({ overflow: 'hidden' });
  });

  it('exposes keyboard sorting, named filtering, and the active sort direction', () => {
    const onSort = vi.fn();
    const onFilter = vi.fn();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Table>
          <TableHeader
            columns={[{ id: 'applicant', label: 'Applicant', isSort: true, isFilter: true }]}
            columnVisibility={{ applicant: true }}
            sorts={[{ column: 'applicant', direction: 'asc' }]}
            onSort={onSort}
            filters={[]}
            onColumnFilterClick={onFilter}
            headerRefs={[]}
            setHeaderRef={vi.fn()}
            getStickyStyle={() => ({})}
            tableUniqId="accessible-actions"
          />
        </Table>
      </ThemeProvider>
    );

    const sortButton = screen.getByRole('button', { name: 'Sort by Applicant' });
    expect(sortButton.tagName).toBe('BUTTON');
    fireEvent.click(sortButton);

    expect(onSort).toHaveBeenCalledWith('applicant', undefined);
    expect(screen.getByRole('columnheader', { name: /Applicant/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Filter Applicant' }));
    expect(onFilter).toHaveBeenCalledOnce();
  });
});
