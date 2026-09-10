import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, cleanup, waitFor } from '@testing-library/react';

import PolicyImpactDialog from './PolicyImpactDialog';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup(overrides: Partial<React.ComponentProps<typeof PolicyImpactDialog>> = {}) {
  const store = configureStore({
    reducer: (state = { confirmPopup: { isChanges: true } }) => state,
  });
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          View impact
        </button>
        {open && (
          <PolicyImpactDialog
            title="Concession Policy"
            policyLabel="Sibling concession · v4"
            description="Selected policy description"
            summary="Eligible on approval."
            rows={[{ id: 'internal-id', name: 'Tuition', treatment: 'Eligible on approval' }]}
            loading={false}
            error={false}
            canRead
            saved={false}
            {...overrides}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Harness />
      </ThemeProvider>
    </Provider>
  );
  return store;
}

it('opens by keyboard, shows readable coverage, closes with Escape and preserves the parent dirty state', async () => {
  const user = userEvent.setup();
  const store = setup();
  const confirm = vi.fn();
  vi.stubGlobal('confirm', confirm);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('dialog', { name: 'Concession Policy impact' })).toBeTruthy();
  expect(screen.getByText('Sibling concession · v4')).toBeTruthy();
  expect(screen.getByText('Tuition')).toBeTruthy();
  expect(screen.queryByText('internal-id')).toBeNull();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'View impact' }));
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  expect(confirm).not.toHaveBeenCalled();
});

it.each([
  [{ rows: undefined, loading: true }, 'Loading fee head impact'],
  [{ rows: undefined, error: true }, 'Policy details could not be loaded.'],
  [{ rows: undefined, canRead: false }, 'Policy details are unavailable with your current access.'],
  [{ rows: undefined }, 'Fee head details for this selected version are not available here.'],
  [{ rows: [] }, 'No fee heads have been added to this structure.'],
])(
  'shows the appropriate availability state and closes with the footer',
  async (props, message) => {
    const user = userEvent.setup();
    setup(props);
    await user.click(screen.getByRole('button', { name: 'View impact' }));
    if ('loading' in props && props.loading)
      expect(screen.getByRole('status', { name: message })).toBeTruthy();
    else expect(screen.getByText(message, { exact: false })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /^Close$/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  }
);
