import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, expect, describe, beforeEach } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { defaultSettings } from 'src/components/settings/config-settings';

import CurriculumNotificationManagement from './CurriculumNotificationManagement';

describe('curriculum notification record controls', () => {
  beforeEach(() => mswServer.use(...iconApiHandlers));
  it('names the real switch input and row actions with their event', () => {
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CurriculumNotificationManagement dialog={{ value: false }} setIsViewMode={() => {}} />
      </ThemeProvider>
    );
    expect(screen.getByRole('table', { name: 'Curriculum Notifications table' })).toBeVisible();
    expect(
      screen.getByRole('switch', { name: 'Enable Subject Published notification' })
    ).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Edit Subject Published notification' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View Subject Published notification' })
    ).toBeEnabled();
  });
});
