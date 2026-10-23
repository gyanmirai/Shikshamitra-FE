import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { CalendarAuditAction } from 'src/enums/academic-calendar';
import { defaultSettings } from 'src/components/settings/config-settings';

import AuditLogsTable from './AuditLogsTable';

const logs = Array.from({ length: 5 }, (_, index) => ({
  id: `audit-${index}`,
  module: 'Academic',
  action: CalendarAuditAction.DayAdded,
  actionLabel: 'Day added',
  entityName: 'School holiday',
  changedByUserId: 'staff-1',
  changedByName: 'Test staff',
  timestamp: '2026-10-21T09:00:00Z',
  hasDiff: false,
}));

describe('calendar audit pagination', () => {
  it('shows the first five records with Previous disabled', () => {
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AuditLogsTable
          logs={logs}
          loading={false}
          totalCount={5}
          page={0}
          rowsPerPage={20}
          onPageChange={() => {}}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('1–5 of 5')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
  });

  it('shows the final server page and translates Previous back to zero-based state', () => {
    const changePage = vi.fn();
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AuditLogsTable
          logs={logs}
          loading={false}
          totalCount={25}
          page={1}
          rowsPerPage={20}
          onPageChange={changePage}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('21–25 of 25')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(changePage).toHaveBeenCalledWith(0, 20);
  });
});
