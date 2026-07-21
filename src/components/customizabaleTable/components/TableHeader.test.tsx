import { Table, Checkbox } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { TableHeader } from './TableHeader';

describe('TableHeader', () => {
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
});
