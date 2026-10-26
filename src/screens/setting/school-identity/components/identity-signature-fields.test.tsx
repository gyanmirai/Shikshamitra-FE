import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import auth from 'src/redux/auth/authSlice';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { IdentitySignatureFields } from './identity-signature-fields';

import type { IdentitySelection } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const createStore = () =>
  configureStore({
    reducer: { auth, [api.reducerPath]: api.reducer },
    preloadedState: {
      auth: {
        ...auth(undefined, { type: 'init' }),
        permissionsInitialized: true,
        permissions: [{ name: 'InstituteSetup.SchoolIdentity.View', isGranted: true }],
      },
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
const load = vi.fn();
beforeEach(() => {
  store = createStore();
  load.mockClear();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/institute-field-formatting/schoolIdentity', () => {
      load();
      return HttpResponse.json({ fields: { principalName: 4, designation: 1 } });
    })
  );
});
afterEach(async () => {
  await act(async () => {
    cleanup();
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

function Fields({
  newSelection = false,
  enableFormatting = true,
}: {
  newSelection?: boolean;
  enableFormatting?: boolean;
}) {
  const [value, setValue] = useState<IdentitySelection>({
    mode: 1,
    assetId: 'signature-image',
    principalName: newSelection ? '' : 'existing NAME',
    designation: newSelection ? 'Principal' : 'existing TITLE',
  });
  return (
    <IdentitySignatureFields
      value={value}
      initialValue={newSelection ? { mode: 0 } : undefined}
      enableFormatting={enableFormatting}
      disabled={false}
      onChange={setValue}
    />
  );
}

it('preserves existing signing text and previews only a newly changed value', async () => {
  render(
    <Provider store={store}>
      <Fields />
    </Provider>
  );
  const name = screen.getByLabelText(/Principal’s name/);
  expect(name).toHaveValue('existing NAME');
  expect(screen.getByLabelText(/Designation/)).toHaveValue('existing TITLE');
  expect(load).not.toHaveBeenCalled();
  fireEvent.change(name, { target: { value: 'new Principal' } });
  expect(await screen.findByText('Will be saved as: NEW PRINCIPAL')).toBeVisible();
  expect(name).toHaveValue('new Principal');
  expect(screen.getByLabelText(/Designation/)).toHaveValue('existing TITLE');
  expect(screen.queryByText(/EXISTING TITLE/)).not.toBeInTheDocument();
});

it('previews the default designation for a newly chosen custom signature', async () => {
  mswServer.use(
    http.get('*/api/app/institute-field-formatting/schoolIdentity', () =>
      HttpResponse.json({ fields: { principalName: 0, designation: 4 } })
    )
  );
  render(
    <Provider store={store}>
      <Fields newSelection />
    </Provider>
  );
  expect(await screen.findByText('Will be saved as: PRINCIPAL')).toBeVisible();
  expect(screen.getByLabelText(/Designation/)).toHaveValue('Principal');
});

it('does not promise school formatting in template-specific signature controls', () => {
  render(
    <Provider store={store}>
      <Fields newSelection enableFormatting={false} />
    </Provider>
  );
  const name = screen.getByLabelText(/Principal’s name/);
  fireEvent.change(name, { target: { value: 'template Name' } });
  expect(name).toHaveValue('template Name');
  expect(load).not.toHaveBeenCalled();
  expect(screen.queryByText(/Will be saved as:/)).not.toBeInTheDocument();
});
