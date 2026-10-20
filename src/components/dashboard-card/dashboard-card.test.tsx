import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { DashboardCard } from './dashboard-card';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
const theme = createTheme();

describe('shared dashboard card compatibility', () => {
  it('retains the existing default value heading and navigation', () => {
    render(
      <ThemeProvider theme={theme}>
        <DashboardCard
          title="Existing metric"
          value={42}
          icon="solar:calendar-outline"
          href="/existing"
          description="Existing description"
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('heading', { name: '42', level: 6 })).toBeVisible();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/existing');
    expect(screen.getByText('Existing description')).toBeVisible();
  });

  it('orders the compact label before its value and accepts value typography props', () => {
    render(
      <ThemeProvider theme={theme}>
        <DashboardCard
          density="compact"
          title="Leave balance"
          value={20}
          icon="solar:calendar-outline"
          valueTypographyProps={{ component: 'p', 'aria-label': 'Available leave days' }}
        />
      </ThemeProvider>
    );
    const label = screen.getByText('Leave balance');
    const value = screen.getByLabelText('Available leave days');
    expect(value.tagName).toBe('P');
    expect(value).toHaveTextContent('20');
    expect(label.compareDocumentPosition(value)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
