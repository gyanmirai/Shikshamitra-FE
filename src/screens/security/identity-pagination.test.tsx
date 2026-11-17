import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { roleType } from 'src/redux/tagTypes';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import UserTable from './user/user-table';
import RoleTable from './role/role-table';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'fixture' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const store = configureStore({
  reducer: { auth: () => ({ permissions: [] }), confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it.each(['users', 'roles'] as const)(
  'loads only the requested %s page and searches the whole collection',
  async (kind) => {
    const requests: URLSearchParams[] = [];
    let fail = false;
    const records = Array.from({ length: 32 }, (_, index) => ({
      id: `record-${index + 1}`,
      name: `Record ${String(index + 1).padStart(2, '0')}`,
      userName: `Record ${String(index + 1).padStart(2, '0')}`,
      roleNames: [],
    }));
    mswServer.use(
      http.get('*/api/identity/roles/all', () => HttpResponse.json({ items: [] })),
      http.get(
        `*/api/${kind === 'users' ? 'security/user-directory' : 'identity/roles'}`,
        ({ request }) => {
          const params = new URL(request.url).searchParams;
          requests.push(params);
          if (fail)
            return HttpResponse.json({ error: { message: 'Page unavailable' } }, { status: 500 });
          const matches = records.filter((record) =>
            record.name.includes(params.get('filter') || '')
          );
          const skip = Number(params.get('skipCount'));
          const size = Number(params.get('maxResultCount'));
          return HttpResponse.json({
            items: matches.slice(skip, skip + size),
            totalCount: matches.length,
          });
        }
      )
    );
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          {kind === 'users' ? (
            <UserTable onAction={() => {}} />
          ) : (
            <RoleTable canCreate={false} onCreate={() => {}} onAction={() => {}} />
          )}
        </ThemeProvider>
      </Provider>
    );
    expect(await screen.findByText('Record 01', { exact: true })).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0].get('maxResultCount')).toBe('10');
    expect(screen.queryByText('Record 11', { exact: true })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(await screen.findByText('Record 11', { exact: true })).toBeVisible();
    expect(requests.at(-1)?.get('skipCount')).toBe('10');
    expect(screen.queryByText('Record 01', { exact: true })).toBeNull();
    fireEvent.change(
      screen.getByRole('textbox', {
        name: kind === 'users' ? 'Search users by name, email, or mobile number' : 'Search roles by name',
      }),
      { target: { value: ' ' } }
    );
    expect(await screen.findByText('Record 01', { exact: true })).toBeVisible();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Go to next page' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(await screen.findByText('Record 11', { exact: true })).toBeVisible();
    fireEvent.change(
      screen.getByRole('textbox', {
        name:
          kind === 'users'
            ? 'Search users by name, email, or mobile number'
            : 'Search roles by name',
      }),
      { target: { value: 'Record 32' } }
    );
    expect(await screen.findByText('Record 32', { exact: true })).toBeVisible();
    expect(requests.at(-1)?.get('skipCount')).toBe('0');
    expect(requests.at(-1)?.get('filter')).toBe('Record 32');
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    fireEvent.change(
      screen.getByRole('textbox', {
        name:
          kind === 'users'
            ? 'Search users by name, email, or mobile number'
            : 'Search roles by name',
      }),
      { target: { value: '' } }
    );
    expect(await screen.findByText('Record 01', { exact: true })).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Rows per page:' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Rows per page:' }));
    fireEvent.click(await screen.findByRole('option', { name: '25' }));
    await waitFor(() => expect(requests.at(-1)?.get('maxResultCount')).toBe('25'));
    expect(await screen.findByText('Record 25', { exact: true })).toBeVisible();
    expect(requests.at(-1)?.get('skipCount')).toBe('0');
    fail = true;
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Page unavailable');
    expect(screen.queryByText('Record 01', { exact: true })).toBeNull();
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Record 26', { exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: kind === 'users' ? 'Sort by Email' : 'Sort by Role' })
    );
    expect(await screen.findByText('Record 01', { exact: true })).toBeVisible();
    expect(requests.at(-1)?.get('skipCount')).toBe('0');
    expect(requests.at(-1)?.get('sorting')).toBe(kind === 'users' ? 'email asc,id' : 'name asc,id');
    if (kind === 'roles') {
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Go to next page' })).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      expect(await screen.findByText('Record 26', { exact: true })).toBeVisible();
      records.splice(25);
      store.dispatch(api.util.invalidateTags([roleType.role]));
      expect(await screen.findByText('Record 01', { exact: true })).toBeVisible();
      expect(requests.at(-1)?.get('skipCount')).toBe('0');
      expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
    }
  },
  15000
);
