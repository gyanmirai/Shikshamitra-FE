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
            family="concession"
            title="Concession Policy"
            policyLabel="Sibling concession · v4"
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
  expect(await screen.findByRole('dialog', { name: 'Sibling concession · v4' })).toBeTruthy();
  expect(screen.getByText('Sibling concession · v4')).toBeTruthy();
  expect(screen.getByText('Tuition')).toBeTruthy();
  expect(screen.queryByText('internal-id')).toBeNull();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'View impact' }));
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  expect(confirm).not.toHaveBeenCalled();
});

it.each(['collection', 'refund', 'proration'] as const)(
  'shows only the header close control in the %s policy preview',
  async (family) => {
    const user = userEvent.setup();
    const policyLabel = `School ${family} · v1 · Default`;
    setup({ family, policyLabel, rows: [] });
    const trigger = screen.getByRole('button', { name: 'View impact' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: policyLabel });
    expect(dialog).toBeVisible();
    expect(screen.getAllByRole('button', { name: /^close$/i })).toHaveLength(1);
    expect(dialog.querySelector('.MuiDialogActions-root')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  }
);

it('dismisses the read-only preview on backdrop click and preserves parent edits', async () => {
  const user = userEvent.setup();
  const store = setup({ rows: [] });
  const confirm = vi.fn();
  vi.stubGlobal('confirm', confirm);
  const trigger = screen.getByRole('button', { name: 'View impact' });
  await user.click(trigger);

  const dialogContainer = screen.getByRole('dialog').parentElement!;
  await user.click(dialogContainer);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  expect(confirm).not.toHaveBeenCalled();
});

it('explains refund coverage and shows the applied version’s amount rule and deduction', async () => {
  const user = userEvent.setup();
  setup({
    family: 'refund',
    title: 'Refund Policy',
    policyLabel: 'School refund · v3',
    rows: [
      { id: 'tuition', name: 'Tuition', treatment: 'Policy eligible' },
      { id: 'transport', name: 'Transport', treatment: 'Excluded' },
    ],
    policy: { AmountMode: 3, PercentageValue: 75, DeductionType: 2, DeductionValue: 5 },
  });
  await user.click(screen.getByRole('button', { name: 'View impact' }));
  expect(screen.getByText('This policy covers 1 of 2 fee heads for refunds.')).toBeVisible();
  expect(screen.getByText('75% of the eligible amount')).toBeVisible();
  expect(screen.getByText('5% deduction')).toBeVisible();
  expect(screen.getByText('Eligible for refunds')).toBeVisible();
  expect(screen.getByText('The policy excludes this fee head from refunds.')).toBeVisible();
  expect(
    screen.queryByText(
      'The refund amount depends on eligible paid amounts and any previous refunds.'
    )
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText('Eligible paid amounts can be considered for a refund under this policy.')
  ).not.toBeInTheDocument();
});

it('reflects a saved collection override that disables late fees for a covered head', async () => {
  const user = userEvent.setup();
  setup({
    family: 'collection',
    title: 'Collection Policy',
    policyLabel: 'Collection · v2',
    saved: true,
    rows: [{ id: 'tuition', name: 'Tuition', treatment: 'Late fee applies' }],
    policy: {
      applyLateFeeToAllFeeHeads: false,
      feeHeadOverrides: [{ feeHeadId: 'tuition', overrideMode: 'NoLateFee' }],
    },
  });
  await user.click(screen.getByRole('button', { name: 'View impact' }));
  expect(screen.getByText('No fee heads accrue late fees under this policy.')).toBeVisible();
  expect(screen.getByText('This fee head has an override that disables late fees.')).toBeVisible();
});

it.each([
  [{ rows: undefined, loading: true }, 'Loading fee head impact'],
  [{ rows: undefined, error: true }, 'Policy details could not be loaded.'],
  [{ rows: undefined, canRead: false }, 'Policy details are unavailable with your current access.'],
  [{ rows: undefined }, 'Fee head details for this selected version are not available here.'],
  [{ rows: [] }, 'No fee heads have been added to this structure.'],
])(
  'shows the appropriate availability state and closes with the header',
  async (props, message) => {
    const user = userEvent.setup();
    setup(props);
    await user.click(screen.getByRole('button', { name: 'View impact' }));
    if ('loading' in props && props.loading)
      expect(screen.getByRole('status', { name: message })).toBeTruthy();
    else expect(screen.getByText(message, { exact: false })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  }
);
