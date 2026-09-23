import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AcademicInsights } from './AcademicInsights';

describe('AcademicInsights', () => {
  it('opens the full insights drawer from the shared trigger', () => {
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
  });
});
