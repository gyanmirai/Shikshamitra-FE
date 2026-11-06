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
    onFocus: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationWorkspaceActions
        disabled={false}
        canViewActivity
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
  expect(screen.getByRole('button', { name: 'Notes & Follow-Ups' })).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Notes & Follow-Ups');
  await user.keyboard('{Enter}');
  expect(actions.onActivity).toHaveBeenCalledOnce();
});

it('locks feature actions during an unavailable read while keeping safe dismissal available', async () => {
  const user = userEvent.setup();
  const actions = renderActions({ disabled: true, closeDisabled: false });
  expect(screen.getByRole('button', { name: 'Application History' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Focus Mode' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Close Application' }));
  expect(actions.onClose).toHaveBeenCalledOnce();
  expect(actions.onFocus).not.toHaveBeenCalled();
});

it('keeps the header focused on record actions without a journey popup or route overrides', () => {
  renderActions();
  expect(screen.getAllByRole('button')).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Application History' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Admission Journey' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Override Route' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Skip Current Step' })).not.toBeInTheDocument();
  screen.getAllByRole('button').forEach((button) => {
    expect(button).not.toHaveAttribute('aria-haspopup');
  });
});
