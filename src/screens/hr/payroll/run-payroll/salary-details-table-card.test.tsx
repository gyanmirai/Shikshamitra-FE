import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SalaryDetailsTableCard } from './salary-details-table-card';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('sorts and filters the actual nested salary component rows by name and numeric amount', async () => {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <SalaryDetailsTableCard
        title="Earnings"
        tableId="synthetic-salary-lines"
        noDataText="No components"
        data={[
          { name: 'Zulu', amount: 2.5 },
          { name: 'Alpha', amount: 100 },
          { name: 'Middle', amount: 10 },
        ]}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Component' }));
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alpha');
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Component' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Component' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Amount' }));
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Zulu');
  fireEvent.click(screen.getByRole('button', { name: 'Filter Amount' }));
  const form = within(screen.getByRole('dialog', { name: 'Filter Amount' }));
  fireEvent.mouseDown(form.getByRole('combobox', { name: 'Filter Type *' }));
  fireEvent.click(screen.getByRole('option', { name: 'Greater Than' }));
  fireEvent.change(form.getByRole('spinbutton', { name: 'Amount *' }), { target: { value: '3' } });
  fireEvent.click(form.getByRole('button', { name: 'Apply' }));
  expect(await screen.findByText('Middle')).toBeVisible();
  expect(screen.queryByText('Zulu')).not.toBeInTheDocument();
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Middle');
});
