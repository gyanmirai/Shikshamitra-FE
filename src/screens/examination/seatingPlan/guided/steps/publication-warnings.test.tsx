import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { PublicationWarnings } from './publication-warnings';

describe('publication warning list', () => {
  it('offers one expandable list with all warning details and no yellow alert cards', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PublicationWarnings
          warnings={[
            {
              code: 'LOW_USAGE',
              message: 'Common Plan: Room B005 utilization is below 40%.',
              examSubjectIds: [],
            },
            {
              code: 'LOW_USAGE',
              message: 'Science: Room B101 utilization is below 40%.',
              examSubjectIds: [],
            },
          ]}
        />
      </ThemeProvider>
    );
    const toggle = screen.getByRole('button', { name: 'Review 2 warnings' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Common Plan: Room B005 utilization is below 40%.')).toBeVisible();
    expect(screen.getByText('Science: Room B101 utilization is below 40%.')).toBeVisible();
  });
});
