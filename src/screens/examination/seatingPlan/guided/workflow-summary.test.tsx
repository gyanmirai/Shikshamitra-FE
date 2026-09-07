import { expect, describe, it } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SummaryRow } from './workflow-summary';

describe('WorkflowSummary rows', () => {
  it('keeps long plan and schedule values in a stable aligned value column', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <SummaryRow label="Schedule" value="Wed, 2 Sep 2026 · 11:30 PM–12:00 AM" />
      </ThemeProvider>
    );

    expect(screen.getByText('Schedule').parentElement).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: '88px minmax(0, 1fr)',
      alignItems: 'start',
    });
    expect(screen.getByText('Wed, 2 Sep 2026 · 11:30 PM–12:00 AM')).toHaveStyle({
      textAlign: 'right',
      overflowWrap: 'anywhere',
    });
  });
});
