import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import { HrReportPreviewTable } from './HrReportPreviewTable';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('shows missing historical amounts as unavailable through the actual shared table', () => {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HrReportPreviewTable
        reportName="Employee salary statement"
        isLoading={false}
        onPageChange={() => {}}
        sortableFields={[]}
        preview={{
          dataSource: 'payroll_statement',
          reportType: 'Employee salary statement',
          page: 1,
          pageSize: 25,
          totalCount: 2,
          normalizedFilters: {},
          columns: [
            { id: 'month', label: 'Month' },
            { id: 'netPay', label: 'Net pay' },
            { id: 'status', label: 'Status' },
          ],
          rows: [
            { month: '2026-09', netPay: null, status: 'Unavailable' },
            { month: '2026-10', netPay: '0.00', status: 'Issued' },
          ],
        }}
      />
    </ThemeProvider>
  );
  const row = screen.getByText('2026-09').closest('tr')!;
  expect(row).toHaveTextContent('UnavailableUnavailable');
  expect(screen.getByText('0.00')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Sort by Net pay' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /Rows per page:/ })).toHaveTextContent('25');
});
