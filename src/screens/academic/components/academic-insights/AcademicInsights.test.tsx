import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AcademicInsights } from './AcademicInsights';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} aria-hidden="true" />,
}));

describe('AcademicInsights', () => {
  it('hides the key metrics section when the drawer only has custom insight content', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicInsights
          title="Result creation insights"
          description="Result readiness checks."
          metrics={[]}
          afterChart={<div>Readiness checks</div>}
          open
          onClose={vi.fn()}
          hideTrigger
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Readiness checks')).toBeInTheDocument();
    expect(screen.queryByText('Key Metrics')).not.toBeInTheDocument();
  });

  it('opens the full insights drawer and explains its purpose in the header tooltip', async () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicInsights
          title="Subject allocation insights"
          description="Current subject readiness."
          metrics={[
            {
              id: 'subjects',
              label: 'Total subjects',
              value: 7,
              helper: 'Selected class',
              icon: 'solar:book-outline',
            },
          ]}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'View full insights' }));

    expect(
      screen.getByRole('heading', { name: 'Subject allocation insights' })
    ).toBeInTheDocument();
    expect(screen.getByText('Total subjects')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByRole('button', { name: 'About Subject allocation insights' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Current subject readiness.');

    fireEvent.click(screen.getByRole('button', { name: 'Close insights' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Subject allocation insights' })
      ).not.toBeInTheDocument()
    );
  });
});
