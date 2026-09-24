import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import AssignmentSummaryDrawer from './AssignmentSummaryDrawer';

describe('AssignmentSummaryDrawer', () => {
  it('shows assignment metrics and applies a selected summary filter', () => {
    const onClose = vi.fn();
    const onFilter = vi.fn();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AssignmentSummaryDrawer
          open
          onClose={onClose}
          total={3}
          assigned={2}
          unassigned={1}
          issues={1}
          preferenceMatchPct={50}
          activeFilter="all"
          onFilter={onFilter}
          onOpenIssues={vi.fn()}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Elective assignment insights' })
    ).toBeInTheDocument();
    expect(screen.getByText('Capacity used')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /2 Assigned/i }));

    expect(onFilter).toHaveBeenCalledWith('assigned');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
