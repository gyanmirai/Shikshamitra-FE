import { useState } from 'react';
import { _api } from '@iconify/react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { it, vi, expect, afterAll, beforeAll, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AccountDialogs } from './account-dialogs';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const theme = createTheme(defaultSettings);
const iconFetch = _api.getFetch();
beforeAll(() => _api.setFetch(() => Promise.resolve(new Response('{}'))));
afterAll(() => {
  if (iconFetch) _api.setFetch(iconFetch);
});
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open password dialog
      </button>
      <AccountDialogs active={open ? 'password' : null} onClose={() => setOpen(false)} />
    </>
  );
}
function view() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, confirmPopup },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>
    </Provider>
  );
  return userEvent.setup();
}
async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('Old password', { exact: false }));
  await user.paste('Current123!');
  await user.click(screen.getByLabelText('New password', { exact: false }));
  await user.paste('Replacement123!');
  await user.click(screen.getByLabelText('Confirm password', { exact: false }));
  await user.paste('Replacement123!');
}

it('groups required fields with header and section guidance and focuses the first invalid field', async () => {
  const user = view();
  expect(screen.getByRole('button', { name: 'Change Password information' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Password Details' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Password Details information' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Old password is required')).toBeVisible();
  expect(screen.getByLabelText('Old password', { exact: false })).toHaveFocus();
  expect(document.querySelectorAll('form')).toHaveLength(1);
});

it.each(['Cancel', 'close', 'Escape'])(
  'guards dirty %s and discards only after a decision',
  async (action) => {
    const user = view();
    await user.type(screen.getByLabelText('Old password', { exact: false }), 'draft');
    if (action === 'Escape') await user.keyboard('{Escape}');
    else await user.click(screen.getByRole('button', { name: action }));
    expect(await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Old password', { exact: false })).toHaveValue('draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Open password dialog' }));
    expect(screen.getByLabelText('Old password', { exact: false })).toHaveValue('');
  }
);

it('submits once with Enter, locks editing and dismissal, and closes on success', async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: unknown[] = [];
  mswServer.use(
    http.post('*/account/my-profile/change-password', async ({ request }) => {
      requests.push(await request.json());
      await gate;
      return new HttpResponse(null, { status: 204 });
    })
  );
  const user = view();
  await fill(user);
  await user.keyboard('{Enter}');
  try {
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toEqual({ currentPassword: 'Current123!', newPassword: 'Replacement123!' });
    expect(screen.getByLabelText('Old password', { exact: false })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    await user.keyboard('{Enter}{Escape}');
    expect(screen.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    expect(requests).toHaveLength(1);
  } finally {
    release();
  }
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('keeps server errors and values visible and allows retry', async () => {
  let attempts = 0;
  mswServer.use(
    http.post('*/account/my-profile/change-password', () => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json(
            { error: { message: 'The current password is incorrect.' } },
            { status: 400 }
          )
        : new HttpResponse(null, { status: 204 });
    })
  );
  const user = view();
  await fill(user);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The current password is incorrect.');
  expect(screen.getByLabelText('New password', { exact: false })).toHaveValue('Replacement123!');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(attempts).toBe(2);
});
