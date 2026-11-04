import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('CustomizableTable summary row', () => {
  it('aligns bold sticky totals with visible columns without rendering record actions', () => {
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomizableTable
          tableId="summary-row"
          columns={[
            { id: 'name', label: 'Student', sticky: true, stickyPosition: 'left' },
            { id: 'hidden', label: 'Hidden', defaultHidden: true },
            { id: 'amount', label: 'Total Fees' },
            { id: 'action', label: 'Actions', render: () => <button>Edit</button> },
          ]}
          data={[{ id: 'student', name: 'Student A', amount: 10 }]}
          summaryRow={{ label: 'Total', values: { amount: '₹ 30', hidden: '₹ 99' } }}
        />
      </ThemeProvider>
    );

    const totalRow = screen.getByRole('row', { name: 'Total ₹ 30' });
    expect(totalRow.closest('tfoot')).not.toBeNull();
    const cells = within(totalRow).getAllByRole('cell');
    expect(cells).toHaveLength(2);
    expect(within(totalRow).getByRole('rowheader')).toHaveTextContent('Total');
    expect(cells[0]).toHaveTextContent('₹ 30');
    expect(cells[0]).toHaveStyle({ position: 'sticky', bottom: '0px', fontWeight: '700' });
    expect(within(totalRow).queryByRole('button')).not.toBeInTheDocument();
    expect(within(totalRow).queryByText('₹ 99')).not.toBeInTheDocument();
  });

  it.each([{ isLoading: true }, { errorContent: 'Unable to load' }])(
    'hides totals while data is unavailable: %o',
    (state) => {
      renderWithProviders(
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <CustomizableTable
            tableId="unavailable-summary"
            columns={[{ id: 'name', label: 'Student' }]}
            data={[]}
            summaryRow={{ label: 'Total', values: {} }}
            {...state}
          />
        </ThemeProvider>
      );
      expect(screen.queryByRole('rowheader', { name: 'Total' })).not.toBeInTheDocument();
    }
  );
});
