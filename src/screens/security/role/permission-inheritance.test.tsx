// @vitest-environment jsdom
import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PermissionAccessForm from './permission-access-form';
import { actionNames, visibilityNames, permissionTestFixture } from './permission-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({
    open: isOpen,
    title,
    content,
    action,
    onClose,
  }: {
    open: boolean;
    title: string;
    content: React.ReactNode;
    action: React.ReactNode;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {content}
        <button type="button" onClick={onClose}>
          Keep editing
        </button>
        {action}
      </div>
    ) : null,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({
    open: isOpen,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.setConfig({ testTimeout: 60000 });
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer, confirmPopup },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
let fixture: ReturnType<typeof permissionTestFixture>;
let store: ReturnType<typeof createStore>;
let styleCache: ReturnType<typeof createCache>;
const theme = createTheme(defaultSettings);
beforeEach(() => {
  styleCache = createCache({ key: 'permission-inheritance-test' });
  clearCachedAuthSession();
  fixture = permissionTestFixture();
  store = createStore();
  mswServer.use(...fixture.handlers);
});
afterEach(() => {
  cleanup();
  styleCache.sheet.flush();
  act(() => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});
async function open(mode: 'actions' | 'visibility' = 'actions', providerName = 'U') {
  const saved = vi.fn();
  render(
    <CacheProvider value={styleCache}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PermissionAccessForm
            editData={{ id: 'synthetic-user', name: 'HOD' }}
            providerName={providerName}
            mode={mode}
            handleClose={saved}
          />
        </ThemeProvider>
      </Provider>
    </CacheProvider>
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Academics' }));
  if (mode === 'actions') fireEvent.click(screen.getByRole('button', { name: 'Curriculum' }));
  return saved;
}
const editor = (action: string, feature = 'Subject Allocation') =>
  within(screen.getByRole('group', { name: `${feature} ${action} editor` }));
const select = (action: string, value: string, feature?: string) =>
  fireEvent.click(editor(action, feature).getByRole('radio', { name: value }));
async function save(saved: ReturnType<typeof vi.fn>) {
  fireEvent.click(screen.getByRole('button', { name: 'Review changes' }));
  expect(fixture.writes).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(saved).toHaveBeenCalledOnce());
}
it('shows editable role defaults without creating a dirty draft', async () => {
  await open();
  ['View', 'Add', 'Delete'].forEach((action) => {
    expect(editor(action).getByRole('radio', { name: 'Follow role' })).toBeChecked();
    expect(editor(action).getByRole('radio', { name: 'Deny' })).toBeEnabled();
    expect(editor(action).getByRole('radiogroup')).toHaveAccessibleDescription(/^Allowed\./);
  });
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  expect(store.getState().confirmPopup.isChanges).toBe(false);
  expect(fixture.writes).toEqual([]);
});
it('persists a deny through role changes and removes it with Follow role', async () => {
  const saved = await open();
  select('Add', 'Deny');
  await save(saved);
  expect(fixture.writes).toEqual([[{ name: actionNames[1], state: 'deny' }]]);
  fixture.role.delete(actionNames[1]);
  fixture.role.add(actionNames[1]);
  cleanup();
  const again = await open();
  expect(editor('Add').getByRole('radio', { name: 'Deny' })).toBeChecked();
  expect(editor('Add').getByRole('radiogroup')).toHaveAccessibleDescription(/^Denied\./);
  fixture.writes.length = 0;
  select('Add', 'Follow role');
  await save(again);
  cleanup();
  await open();
  expect(editor('Add').getByRole('radiogroup')).toHaveAccessibleDescription(/^Allowed\./);
  expect(fixture.denies.size).toBe(0);
  // This scenario mounts and saves three complete editors, including two persisted reloads.
}, 120000);
it('clears an explicit allow on Follow role when the role has no grant', async () => {
  fixture.role.delete(actionNames[1]);
  fixture.direct.add(actionNames[1]);
  const saved = await open();
  expect(editor('Add').getByRole('radio', { name: 'Allow' })).toBeChecked();
  select('Add', 'Follow role');
  await save(saved);
  expect(fixture.direct.size).toBe(0);
  expect(editor('Add').getByRole('radiogroup')).toHaveAccessibleDescription(/^Denied\./);
});
it('keeps visibility overrides independent from action grants and retains nested flags', async () => {
  const saved = await open('visibility');
  expect(screen.getByTestId('permission-Curriculum / Settings')).toBeInTheDocument();
  select('Visible', 'Deny', 'Curriculum');
  await save(saved);
  expect(fixture.writes).toEqual([[{ name: visibilityNames[1], state: 'deny' }]]);
  expect(fixture.role.has(actionNames[0])).toBe(true);
});
it('keeps server-only visibility out of the feature list and saves only an edited constant flag', async () => {
  const serverOnlyNames = [
    'ShikshaMitra.Module.Academics.ServerOnlyFeature',
    'ShikshaMitra.Module.ServerOnlyModule',
  ];
  mswServer.use(
    http.get('*/api/shikshamitra-permissions/users/:userId/permissions', () =>
      HttpResponse.json({
        overrides: Object.fromEntries([...fixture.denies].map((name) => [name, 'deny'])),
        groups: [
          {
            name: 'Academics',
            displayName: 'Academics',
            permissions: [...actionNames, ...visibilityNames, ...serverOnlyNames].map((name) => ({
              name,
              displayName: name,
              isGranted: !fixture.denies.has(name),
              allowedProviders: [],
              grantedProviders: [{ providerName: 'R', providerKey: 'HOD' }],
            })),
          },
        ],
      })
    )
  );
  const saved = await open('visibility');
  expect(screen.queryByRole('button', { name: 'Additional visibility' })).not.toBeInTheDocument();
  expect(screen.queryByTestId('permission-Server Only Feature')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Server Only Module' })).not.toBeInTheDocument();
  expect(screen.getByTestId('permission-Curriculum / Settings')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  select('Visible', 'Deny', 'Curriculum');
  await save(saved);
  expect(fixture.writes).toEqual([[{ name: visibilityNames[1], state: 'deny' }]]);
});
it('shows constants missing from the server catalogue with unavailable controls', async () => {
  await open('visibility');
  expect(screen.getByTestId('permission-Timetable')).toBeInTheDocument();
  const timetable = editor('Visible', 'Timetable');
  expect(timetable.getByRole('radiogroup')).toHaveAccessibleDescription(/^Unavailable\./);
  ['Follow role', 'Allow', 'Deny'].forEach((value) => {
    const choice = timetable.getByRole('radio', { name: value });
    expect(choice).toBeDisabled();
    fireEvent.click(choice);
  });
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  expect(fixture.writes).toEqual([]);
});
it('keeps role actions editable while provider-restricted user actions are unavailable', async () => {
  await open('actions', 'R');
  expect(editor('View').getByRole('radio', { name: 'Revoke' })).toBeEnabled();
  cleanup();
  fixture.roleOnly.add(actionNames[1]);
  await open();
  expect(editor('Add').getByRole('radio', { name: 'Deny' })).toBeDisabled();
  expect(fixture.writes).toEqual([]);
});
it('combines assigned role defaults while an explicit deny wins', async () => {
  fixture.secondRole.add(actionNames[0]);
  fixture.role.delete(actionNames[0]);
  await open();
  expect(editor('View').getByRole('radiogroup')).toHaveAccessibleDescription(/^Allowed\./);
  cleanup();
  fixture.denies.add(actionNames[0]);
  await open();
  expect(editor('View').getByRole('radiogroup')).toHaveAccessibleDescription(/^Denied\./);
});
it('refreshes Follow role defaults without manufacturing a user grant', async () => {
  await open();
  cleanup();
  // Revoke action defaults while retaining the independent navigation grants.
  actionNames.forEach((name) => fixture.role.delete(name));
  await open();
  ['View', 'Add', 'Delete'].forEach((action) => {
    expect(editor(action).getByRole('radio', { name: 'Follow role' })).toBeChecked();
    expect(editor(action).getByRole('radio', { name: 'Allow' })).toBeEnabled();
    expect(editor(action).getByRole('radiogroup')).toHaveAccessibleDescription(/^Denied\./);
  });
  expect(fixture.direct.size).toBe(0);
  expect(fixture.denies.size).toBe(0);
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  expect(fixture.writes).toEqual([]);
});
it('keeps revoked role visibility separate from denied action defaults', async () => {
  fixture.role.clear();
  await open();
  ['View', 'Add', 'Delete'].forEach((action) => {
    expect(editor(action).getByRole('radio', { name: 'Follow role' })).toBeChecked();
    expect(editor(action).getByRole('radio', { name: 'Allow' })).toBeDisabled();
    expect(editor(action).getByRole('radio', { name: 'Deny' })).toBeEnabled();
    expect(editor(action).getByRole('radiogroup')).toHaveAccessibleDescription(/Enable Visibility .*Denied\./);
  });
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  expect(fixture.direct.size).toBe(0);
  expect(fixture.denies.size).toBe(0);
  expect(fixture.writes).toEqual([]);
});
it('saves Deny and Follow role for a hidden feature without granting visibility', async () => {
  fixture.role.clear();
  fixture.direct.add(actionNames[1]);
  const saved = await open();
  expect(editor('Add').getByRole('radio', { name: 'Allow' })).toBeDisabled();
  select('Add', 'Deny');
  await save(saved);
  expect(fixture.writes).toEqual([[{ name: actionNames[1], state: 'deny' }]]);
  expect(fixture.direct.size).toBe(0);
  expect(fixture.denies.has(actionNames[1])).toBe(true);
  // A successful save closes the owning dialog; reopen with the persisted catalogue.
  cleanup();
  fixture.writes.length = 0;
  const reopened = await open();
  expect(editor('Add').getByRole('radio', { name: 'Deny' })).toBeChecked();
  select('Add', 'Follow role');
  await save(reopened);
  expect(fixture.writes).toEqual([[{ name: actionNames[1], state: 'inherit' }]]);
  expect(fixture.direct.size).toBe(0);
  expect(fixture.denies.size).toBe(0);
  expect(fixture.role.size).toBe(0);
  expect(editor('Add').getByRole('radio', { name: 'Allow' })).toBeDisabled();
}, 120000);
it('reviews dependency changes, returns to editing, and discards without a write', async () => {
  await open();
  select('View', 'Deny');
  expect(screen.getByText('3 unsaved permission changes')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Review changes' }));
  const review = within(screen.getByRole('dialog', { name: 'Review permission changes' }));
  expect(review.getAllByText('Deny', { exact: true })).toHaveLength(3);
  fireEvent.click(review.getByRole('button', { name: 'Back to editing' }));
  expect(editor('View').getByRole('radio', { name: 'Deny' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Discard permission changes?' })).getByRole(
      'button',
      { name: 'Discard changes' }
    )
  );
  await waitFor(() =>
    expect(editor('View').getByRole('radio', { name: 'Follow role' })).toBeChecked()
  );
  expect(screen.getByRole('button', { name: 'Review changes' })).toBeDisabled();
  expect(fixture.writes).toEqual([]);
}, 120000);
