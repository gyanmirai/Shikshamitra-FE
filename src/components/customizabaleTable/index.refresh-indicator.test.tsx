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

it('overlays the default linear refresh indicator without taking space from the table', () => {
  renderWithProviders(table());
  const progress = screen.getByRole('progressbar', { name: 'Refreshing Admission Inquiries' });
  expect(progress).toBeVisible();
  expect(progress).toHaveStyle({ position: 'absolute' });
  expect(screen.getByText('Saved applicant')).toBeVisible();
});

it('uses an accessible skeleton status without replacing safe rows when opted in', () => {
  renderWithProviders(table({ refreshIndicator: 'skeleton' }));
  expect(screen.getByRole('status', { name: 'Refreshing Admission Inquiries' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByText('Saved applicant')).toBeVisible();
  expect(screen.queryByText('No admission inquiries')).not.toBeInTheDocument();
});

it('updates the scoped refresh presentation and clears it after the request settles', () => {
  const view = renderWithProviders(table());
  view.rerender(table({ refreshIndicator: 'skeleton' }));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Refreshing Admission Inquiries' })).toBeVisible();
  view.rerender(table({ refreshIndicator: 'skeleton', isRefreshing: false }));
  expect(
    screen.queryByRole('status', { name: 'Refreshing Admission Inquiries' })
  ).not.toBeInTheDocument();
  expect(screen.getByText('Saved applicant')).toBeVisible();
});

it('keeps initial table skeleton ownership and avoids an empty-state flash', () => {
  renderWithProviders(table({ refreshIndicator: 'skeleton', isLoading: true, data: [] }));
  expect(
    screen.queryByRole('status', { name: 'Refreshing Admission Inquiries' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.queryByText('No admission inquiries')).not.toBeInTheDocument();
});

it('does not mask a blocking error with refresh feedback', () => {
  renderWithProviders(
    table({ refreshIndicator: 'skeleton', errorContent: 'Unable to load inquiries', data: [] })
  );
  expect(screen.getByText('Unable to load inquiries')).toBeVisible();
  expect(
    screen.queryByRole('status', { name: 'Refreshing Admission Inquiries' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
