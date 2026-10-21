import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ApplicationWorkspaceActions } from './application-workspace-actions';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

function renderActions(overrides = {}) {
  const actions = {
    onActivity: vi.fn(),
    onHistory: vi.fn(),
    onJourney: vi.fn(),
    onFocus: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationWorkspaceActions
        disabled={false}
        canViewActivity
        journeyOpen={false}
        historySelected={false}
        focused={false}
        {...actions}
        {...overrides}
      />
    </ThemeProvider>
  );
  return actions;
}

it('uses the shared custom tooltip for keyboard-focused icon actions', async () => {
  const user = userEvent.setup();
  const actions = renderActions();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Notes & Follow-ups' })).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Notes & Follow-ups');
  await user.keyboard('{Enter}');
  expect(actions.onActivity).toHaveBeenCalledOnce();
});

it('locks feature actions during an unavailable read while keeping safe dismissal available', async () => {
  const user = userEvent.setup();
  const actions = renderActions({ disabled: true, closeDisabled: false });
  expect(screen.getByRole('button', { name: 'Admission journey' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Focus mode' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Close application' }));
  expect(actions.onClose).toHaveBeenCalledOnce();
  expect(actions.onFocus).not.toHaveBeenCalled();
});
