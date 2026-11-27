import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomizableTable from '.';

import type { ICustomizableTableProps } from './types';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
function table(props: Partial<ICustomizableTableProps> = {}) {
  return (
    <ThemeProvider theme={theme}>
      <CustomizableTable
        tableId="refresh-indicator"
        tableTitle="Admission Inquiries"
        columns={[{ id: 'name', label: 'Applicant' }]}
        data={[{ id: 'inquiry-one', name: 'Saved applicant' }]}
        showToolbar={false}
        isRefreshing
        noDataText="No admission inquiries"
        {...props}
      />
    </ThemeProvider>
  );
}

it('overlays the refresh indicator at the top without taking space from the table', () => {
  renderWithProviders(table());
  const progress = screen.getByRole('progressbar', { name: 'Refreshing Admission Inquiries' });
  expect(progress).toBeVisible();
  expect(progress).toHaveStyle({ position: 'absolute', top: '0px' });
  expect(document.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
  expect(screen.getByText('Saved applicant')).toBeVisible();
  expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
});

it('clears refresh feedback after the request settles', () => {
  const view = renderWithProviders(table());
  view.rerender(table({ isRefreshing: false }));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
  expect(screen.getByText('Saved applicant')).toBeVisible();
});

it('uses a compact spinner outside the table header for Admissions refreshes', () => {
  const view = renderWithProviders(table({ refreshIndicator: 'circular' }));
  const progress = screen.getByRole('progressbar', { name: 'Refreshing Admission Inquiries' });
  expect(progress).toHaveClass('MuiCircularProgress-root');
  expect(screen.getByRole('table')).not.toContainElement(progress);
  expect(progress.parentElement).toHaveAttribute('data-testid', 'table-refresh-slot');
  expect(document.querySelector('.MuiLinearProgress-root')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByText('Saved applicant')).toBeVisible();
  expect(screen.getByText('Dense')).toBeVisible();

  view.rerender(table({ refreshIndicator: 'circular', isRefreshing: false }));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
  expect(screen.getByText('Saved applicant')).toBeVisible();
});

it('keeps the refresh spinner in the toolbar without a green bar or header overlap', () => {
  renderWithProviders(table({ refreshIndicator: 'circular', showToolbar: true }));
  const progress = screen.getByRole('progressbar', { name: 'Refreshing Admission Inquiries' });
  expect(progress.parentElement).toHaveAttribute('data-testid', 'table-refresh-slot');
  expect(screen.getByRole('table')).not.toContainElement(progress);
  expect(document.querySelector('.MuiLinearProgress-root')).not.toBeInTheDocument();
});

it('keeps initial table skeleton ownership and avoids an empty-state flash', () => {
  renderWithProviders(table({ isLoading: true, data: [] }));
  expect(screen.getByRole('table').querySelector('tbody .MuiSkeleton-root')).toBeVisible();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.queryByText('No admission inquiries')).not.toBeInTheDocument();
});

it('does not mask a blocking error with refresh feedback', () => {
  renderWithProviders(table({ errorContent: 'Unable to load inquiries', data: [] }));
  expect(screen.getByText('Unable to load inquiries')).toBeVisible();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
