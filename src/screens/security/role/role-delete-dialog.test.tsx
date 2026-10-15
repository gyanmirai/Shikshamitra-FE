// @vitest-environment jsdom
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { shikshaMitraToast } from 'src/components/toast';
import { defaultSettings } from 'src/components/settings';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import RoleDeleteDialog from './role-delete-dialog';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
const message = 'This role is assigned to 2 user(s) and cannot be deleted. Reassign or remove those users first.';
const createStore = () => configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
let store: ReturnType<typeof createStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  shikshaMitraToast.dismiss();
  act(() => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});
function open() {
  const close = vi.fn();
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}>
    <RoleDeleteDialog role={{ id: 'qa-role', name: 'Intern Teacher' }} onClose={close} />
  </ThemeProvider></Provider>);
  return close;
}

it('retains the role and actionable server reason after 409, then allows a successful retry', async () => {
  let writes = 0;
  mswServer.use(http.delete('*/api/identity/roles/qa-role', () => {
    writes += 1;
    return writes === 1 ? HttpResponse.json({ status: 409, detail: message,
      errorCode: 'ShikshaMitra:RoleAssignedToUsers', data: { UserCount: 2 } }, { status: 409 }) : new HttpResponse(null, { status: 204 });
  }));
  const close = open();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.getByRole('dialog', { name: 'Delete Role' })).toHaveTextContent('Intern Teacher');
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(writes).toBe(2);
});

it('locks submission, cancel and Escape while the request is pending', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let writes = 0;
  mswServer.use(http.delete('*/api/identity/roles/qa-role', async () => {
    writes += 1;
    await pending;
    return new HttpResponse(null, { status: 204 });
  }));
  const close = open();
  const button = screen.getByRole('button', { name: 'Delete' });
  fireEvent.click(button);
  await waitFor(() => expect(button).toBeDisabled());
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  fireEvent.click(button);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(close).not.toHaveBeenCalled();
  await act(async () => release());
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(writes).toBe(1);
});

it('lets the user cancel after a failed deletion', async () => {
  mswServer.use(http.delete('*/api/identity/roles/qa-role', () => HttpResponse.json({ detail: message }, { status: 409 })));
  const close = open();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledOnce();
});

it('shows success even when closing immediately unmounts the dialog', async () => {
  mswServer.use(http.delete('*/api/identity/roles/qa-role', () => new HttpResponse(null, { status: 204 })));
  function Workflow() {
    const [isOpen, setOpen] = useState(true);
    return <>
      <Toaster />
      {isOpen && <RoleDeleteDialog role={{ id: 'qa-role', name: 'Unused QA role' }} onClose={() => setOpen(false)} />}
    </>;
  }
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}><Workflow /></ThemeProvider></Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText('Role deleted successfully')).toBeVisible();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
